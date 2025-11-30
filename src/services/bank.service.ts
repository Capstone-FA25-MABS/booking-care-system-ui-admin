import { VietQRResponse, Bank } from '../types/bank.types';

const VIETQR_API_URL = 'https://api.vietqr.io/v2/banks';

export class BankService {
    private static banksCache: Bank[] | null = null;
    private static cacheExpiry: number = 0;
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static async getBanks(): Promise<Bank[]> {
        // Check cache first
        if (this.banksCache && Date.now() < this.cacheExpiry) {
            return this.banksCache;
        }

        try {
            const response = await fetch(VIETQR_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: VietQRResponse = await response.json();

            if (data.code !== '00') {
                throw new Error(`API error: ${data.desc}`);
            }

            // Cache the data
            this.banksCache = data.data;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            return data.data;
        } catch (error) {
            console.error('Error fetching banks:', error);
            // Return fallback data if API fails
            return this.getFallbackBanks();
        }
    }

    static async getPopularBanks(): Promise<Bank[]> {
        const allBanks = await this.getBanks();
        // Return most popular Vietnamese banks
        const popularBankCodes = [
            'VCB',
            'ICB',
            'CTG',
            'BIDV',
            'VBA',
            'TCB',
            'MB',
            'STB',
            'HDB',
            'TPB',
        ];

        return allBanks
            .filter((bank) => popularBankCodes.includes(bank.code))
            .sort((a, b) => {
                const aIndex = popularBankCodes.indexOf(a.code);
                const bIndex = popularBankCodes.indexOf(b.code);
                return aIndex - bIndex;
            });
    }

    private static getFallbackBanks(): Bank[] {
        // Fallback data in case API is unavailable
        return [
            {
                id: 43,
                name: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
                code: 'VCB',
                bin: '970436',
                shortName: 'Vietcombank',
                logo: 'https://cdn.vietqr.io/img/VCB.png',
                transferSupported: 1,
                lookupSupported: 1,
                short_name: 'Vietcombank',
                support: 3,
                isTransfer: 1,
                swift_code: 'BFTVVNVX',
            },
            {
                id: 17,
                name: 'Ngân hàng TMCP Công thương Việt Nam',
                code: 'ICB',
                bin: '970415',
                shortName: 'VietinBank',
                logo: 'https://cdn.vietqr.io/img/ICB.png',
                transferSupported: 1,
                lookupSupported: 1,
                short_name: 'VietinBank',
                support: 3,
                isTransfer: 1,
                swift_code: 'ICBVVNVX',
            },
            {
                id: 9,
                name: 'Ngân hàng Đầu tư và Phát triển Việt Nam',
                code: 'BIDV',
                bin: '970418',
                shortName: 'BIDV',
                logo: 'https://cdn.vietqr.io/img/BIDV.png',
                transferSupported: 1,
                lookupSupported: 1,
                short_name: 'BIDV',
                support: 3,
                isTransfer: 1,
                swift_code: 'BIDVVNVX',
            },
        ];
    }
}

export default BankService;
