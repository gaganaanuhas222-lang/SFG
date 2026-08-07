import * as crypto from 'crypto';
import { CRYPTO_ALGO_TYPES } from '../enums/cryptoAlgoTypes';
import { DIGEST } from '../enums/digest';

export const stringToHash = (
    input: string,
    algo: CRYPTO_ALGO_TYPES,
    digest: DIGEST) => {

    const hash = crypto.createHash(algo);
    hash.update(input);
    return hash.digest(digest);
}