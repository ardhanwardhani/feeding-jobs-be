const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Job API',
            version: '1.0.0',
            description: 'API documentation for Job management',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
