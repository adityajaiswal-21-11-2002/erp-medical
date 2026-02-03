"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error.issues.map((i) => i.message).join(", "),
            });
        }
        next();
    };
}
