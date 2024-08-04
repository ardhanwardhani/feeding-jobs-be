const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jobRoutes = require('./routes/jobs');
const sequelize = require('./config/database');

const app = express();
const corsOption = {
    origin: 'http://localhost:5173',
};

app.use(cors(corsOption));
app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Job API',
            version: '1.0.0',
            description: 'API for managing jobs',
        },
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/jobs', jobRoutes);

sequelize.sync().then(() => {
    console.log('Database connected');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});