// Single source for the JWT signing secret.
// A hard-coded fallback is only tolerated outside production.
let warned = false;

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (secret) {
        return secret;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
    }

    if (!warned) {
        console.warn('WARNING: JWT_SECRET is not set; using an insecure development secret.');
        warned = true;
    }

    return 'dev-only-insecure-secret';
};

module.exports = { getJwtSecret };
