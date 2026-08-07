import * as crypto from 'crypto';
import { CRYPTO_ALGO_TYPES } from '../enums/cryptoAlgoTypes';
import { DIGEST } from '../enums/digest';
import { APP_CONFIG } from '../app';

export const stringToHash = (
    input: string,
    algo: CRYPTO_ALGO_TYPES,
    digest: DIGEST) => {

    if (!input) return '';

    const hash = crypto.createHash(algo);
    hash.update(input);
    return hash.digest(digest);
}

export const passwordToHash = (stringPasswrod: string) => stringToHash(
    stringPasswrod,
    APP_CONFIG.PASSWORD_ALGO,
    APP_CONFIG.PASSWORD_DIGEST
) 