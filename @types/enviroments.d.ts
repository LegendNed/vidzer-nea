declare namespace NodeJS {
    export interface ProcessEnv {
        NODE_ENV: 'DEV' | 'PROD';

        SECRET: string;

        DB_URL: string;
        DB_USERNAME: string;
        DB_PASSWORD: string;

        //Development variables
        DEV_DB_URL: string;
        DEV_DB_USERNAME: string;
        DEV_DB_PASSWORD: string;
    }
}