const http = require('http');
const mysql = require('mysql2');
const url = require('url');

// MySQL connection setup (modify credentials accordingly)
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'lab5-db-1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'my-secret-pw',
    database: process.env.DB_DATABASE || 'hospital',
    port: 3306
});

connection.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL!");
    // Create the patient table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS patients (
            patientid INT(11) AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            dateOfBirth DATETIME
        ) ENGINE=InnoDB;
    `;
    connection.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log("Patient table created or already exists.");
    });
});

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    // Add CORS headers to every response
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

    // Handle preflight requests (OPTIONS requests)
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // No content for OPTIONS requests
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/api/v1/patient') {
        const patientsToInsert = [
            { name: 'Sara Brown', dateOfBirth: '1990-01-01' },
            { name: 'Mlon Eusk', dateOfBirth: '1961-02-01' },
            { name: 'Mack Ja', dateOfBirth: '1940-03-01' },
            { name: 'John Doe', dateOfBirth: '1990-04-01' },
        ];

        // Insert each patient record into the database
        patientsToInsert.forEach(patient => {
            const query = `INSERT INTO patients (name, dateOfBirth) VALUES (?, ?)`;
            connection.query(query, [patient.name, patient.dateOfBirth], (err, result) => {
                if (err) {
                    res.end(JSON.stringify({ error: err.message }));
                    return;
                }
            });
        });

        res.end(JSON.stringify({ message: 'Patients inserted' }));

    } else if (req.method === 'POST' && parsedUrl.pathname === '/api/v1/sql') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { query } = JSON.parse(body);
            if (query.toLowerCase().startsWith('select')) {
                connection.query(query, (err, results) => {
                    if (err) {
                        res.end(JSON.stringify({ error: err.message }));
                        return;
                    }
                    res.end(JSON.stringify(results));
                });
            } else {
                res.end(JSON.stringify({ error: 'Only SELECT queries are allowed' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

// Start the server on port 3001
server.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
