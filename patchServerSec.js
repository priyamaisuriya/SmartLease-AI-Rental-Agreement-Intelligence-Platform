const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'backend/server.js');
let content = fs.readFileSync(serverPath, 'utf8');

if (!content.includes('const helmet = require')) {
    content = content.replace(
        "const path = require('path');",
        "const path = require('path');\nconst helmet = require('helmet');\nconst mongoSanitize = require('express-mongo-sanitize');\nconst xss = require('xss-clean');\nconst rateLimit = require('express-rate-limit');"
    );

    const middlewares = `
// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (high to prevent breaking existing apps)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

`;

    content = content.replace(
        "// ============================================================\n// MIDDLEWARE\n// ============================================================\n\napp.use(cors());",
        "// ============================================================\n// MIDDLEWARE\n// ============================================================\n\napp.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));\n" + middlewares
    );
}

if (!content.includes('errorHandler')) {
    const errorHandler = `
// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : err.message;
    res.status(statusCode).json({ message });
});
`;
    content = content.replace(
        "// ============================================================\n// START SERVER\n// ============================================================",
        errorHandler + "\n\n// ============================================================\n// START SERVER\n// ============================================================"
    );
}

fs.writeFileSync(serverPath, content);
console.log("Updated server.js");
