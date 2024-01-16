//middleware/VerifyToken.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }

        // Simpan informasi tambahan dari token di req.userId atau req.user atau req.data (sesuai kebutuhan)
        req.userId = decoded.userId;

        // Pemanggilan next() memungkinkan eksekusi berlanjut ke middleware atau handler berikutnya
        next();
    });
};
