import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
    protected sendCreateUpdateErrorResponse(
        res: Response,
        error: mongoose.Error.ValidationError | Error
    ): void {
        if (error instanceof mongoose.Error.ValidationError) {
            const clientErros = this.handleClientErrors(error);
            res.status(clientErros.code).send({
                code: clientErros.code,
                error: clientErros.error,
            });
        } else {
            res.status(500).send({ code: 500, error: 'Something went wrong' });
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): {
        code: number;
        error: string;
    } {
        const duplicatedKindErrors = Object.values(error.errors).filter(
            (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
        );
        if (duplicatedKindErrors.length > 0) {
            return { code: 409, error: error.message };
        }
        return { code: 422, error: error.message };
    }
}
