const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const Job = require('../models/Job');
const ExcelJS = require('exceljs');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               companyName:
 *                 type: string
 *               workType:
 *                 type: string
 *               locations:
 *                 type: string
 *               salary:
 *                 type: string
 *               bulletPoints:
 *                 type: array
 *                 items:
 *                   type: string
 *               listingDate:
 *                 type: string
 *                 format: date
 *               tag:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
    try {
        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter jobs by tag
 *     responses:
 *       200:
 *         description: List of jobs
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
    try {
        let { tag } = req.query;
        
        if (tag) {
            tag = tag.replace(/ /g, '-');
        }

        const filter = tag ? { tag: tag } : {};

        const jobs = await Job.findAll({ where: filter });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job data
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               companyName:
 *                 type: string
 *               workType:
 *                 type: string
 *               locations:
 *                 type: string
 *               salary:
 *                 type: string
 *               bulletPoints:
 *                 type: array
 *                 items:
 *                   type: string
 *               listingDate:
 *                 type: string
 *                 format: date
 *               tag:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Job not found
 */
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.update(req.body);
        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.destroy();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /jobs/scrape/{keyword}:
 *   get:
 *     summary: Scrape job data from JobStreet and save to database
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword for scraping job data
 *     responses:
 *       200:
 *         description: Successfully scraped and saved job data
 *       500:
 *         description: Internal server error
 */
async function scrapeSite(keyword){
    const url = `https://id.jobstreet.com/id/${keyword}-jobs`;
    // https://id.jobstreet.com/id/Java-Spring-jobs
    const  { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $('[data-automation=server-state]').contents().text()
}

router.get('/scrape/:keyword', async (req, res) => {
    let keyword = req.params.keyword;
    keyword = keyword.split(' ').join('-');
    try {
        const result = await scrapeSite(keyword);
        let result1 = result.split('};')
        if(result1?.length > 0 ){
            for(var i = 0; i < result1.length; i++){
                result1[i] = result1[i] + '}';
            }
        }

        let result2 = result1[1].split(' = ')
        let data = JSON.parse(result2[1])
        let jobs = data.results.results.jobs
        let value = []
        jobs.forEach(job => {
            let bulletPoints = []

            let companyName = job.companyName != null ? job.companyName : (job.advertiser?.description ?? '')

            let points = job.bulletPoints != null ? job.bulletPoints : ''
            if (points != null) {
                points.forEach(point => {
                    bulletPoints.push(point)
                })
            }

            value.push({
                title: job.title,
                companyName: companyName,
                workType: job.workType,
                locations: job.jobLocation.label,
                salary: job.salary,
                bulletPoints: bulletPoints,
                listingDate: job.listingDate,
                tag: keyword
            });
        });
        await Job.bulkCreate(value);
        res.json(value);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occured while scraping the site');
    }
});

/**
 * @swagger
 * /jobs/export:
 *   post:
 *     summary: Export job data to Excel
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         required: false
 *         description: Tag to filter job data
 *     responses:
 *       200:
 *         description: Successfully exported job data to Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal server error
 */
router.post('/export', async (req, res) => {
    try {
        let { tag } = req.query;
        
        if (tag) {
            tag = tag.replace(/ /g, '-');
        }

        const filter = tag ? { tag: tag } : {};

        const jobs = await Job.findAll({ where: filter });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jobs');

        worksheet.columns = [
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Company Name', key: 'companyName', width: 30 },
            { header: 'Work Type', key: 'workType', width: 15 },
            { header: 'Locations', key: 'locations', width: 30 },
            { header: 'Salary', key: 'salary', width: 30 },
            { header: 'Bullet Points', key: 'bulletPoints', width: 50 },
            { header: 'Listing Date', key: 'listingDate', width: 15 },
        ];

        jobs.forEach(job => {
            worksheet.addRow({
                title: job.title,
                companyName: job.companyName,
                workType: job.workType,
                locations: job.locations,
                salary: job.salary,
                bulletPoints: job.bulletPoints ? job.bulletPoints.join(', ') : '',
                listingDate: job.listingDate ? job.listingDate.toISOString().split('T')[0] : '',
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=jobs.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while exporting data to Excel');
    }
});

module.exports = router;
