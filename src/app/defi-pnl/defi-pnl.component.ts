import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { WalletSelectionComponent } from '../wallet-selection/wallet-selection.component';
import { AccountInterface } from '../interfaces/account.interface';
import { LifiService } from '../services/lifi.service';
import { LifiToken, LifiTransactionInterface } from '../interfaces/lifi-transaction.interface';
import { LifiChainInterface } from '../interfaces/lifi-chain.interface';

@Component({
  selector: 'app-defi-pnl',
  standalone: true,
  imports: [
    CommonModule,
    WalletSelectionComponent,
    TableModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './defi-pnl.component.html',
  styleUrl: './defi-pnl.component.scss'
})
export class DefiPnlComponent implements OnInit {
    private authService = inject(AuthService);
    private lifiService = inject(LifiService);
    selectedAccount: AccountInterface | null = null;
    transactions: LifiTransactionInterface[] | undefined;
    tokensBought: {
        token: LifiToken,
        transactions: LifiTransactionInterface[],
        pnl: number,
        totalBoughtUSD: number,
        totalBought: number,
    }[] = [];
    totalPnl: number = 0;
    chains: LifiChainInterface[] = [];
    selectedYear: number = dayjs().year() - 1;
    availableYears: number[] = [];
    private currentTokenInfoStore: {[key: string]: LifiToken} = {};

    displayedColumns: string[] = ['token', 'amount', 'usd', 'pnl'];
    displayedTransactionColumns: string[] = ['date', 'tokenReceived', 'tokenSent', 'amountReceived', 'amountUsdReceived', 'tokenReceivedPrice'];

    ngOnInit(): void {
        // Generate available years (from 2020 to current year)
        const currentYear = dayjs().year();
        for (let year = currentYear; year >= 2020; year--) {
            this.availableYears.push(year);
        }

        if (this.authService.isAuthenticated()) {
            this.lifiService.getChains().subscribe(chains => {
                this.chains = chains;
            });
        }

        this.authService.logged$.subscribe(() => {
        this.loadPnlData(this.selectedYear);
        });

        // Subscribe to authentication changes
        this.authService.unauthorized$.subscribe(() => {
        this.resetData();
        });
    }

    public selectAccount(event: any) {
        this.selectedAccount = event.value;
        this.loadPnlData(this.selectedYear);
    }

    public selectYear(event: any) {
        this.selectedYear = event.value;
        this.loadPnlData(this.selectedYear);
    }

    public getChain(chainId: number): LifiChainInterface | undefined {
        return this.chains.find(chain => chain.id === chainId);
    }

    private getTotalPnl() {
        this.totalPnl = this.tokensBought?.map(t => t.pnl)
        .reduce((acc, value) => acc + value, 0);
    }

    private loadPnlData(year: number) {
        // TODO: Implement PnL data loading logic
        console.log('Loading PnL data for year:', year);
        this.totalPnl = 0;
        this.transactions = [];
        this.lifiService.getChains().subscribe(chains => {
            console.log('Available chains from LiFi:', chains);
        });
        if (this.selectedAccount) {
            this.lifiService.getWalletTransfers(
                { wallet: this.selectedAccount.address,
                    limit: 100,
                    fromTimestamp: dayjs().year(year).startOf('year').unix(),
                    toTimestamp: dayjs().year(year).endOf('year').unix(),

            }).subscribe(transfers => {
                this.transactions = transfers.data;
                this.calculatePnl();
            });
        }
    }

    private calculatePnl() {
        this.tokensBought = [];
        this.transactions = 
        this.transactions?.filter(tx => 
            tx.receiving.token.symbol !== tx.sending.token.symbol
            && (tx.receiving.token.symbol !== `W${tx.sending.token.symbol}`
            && `W${tx.receiving.token.symbol}` !== tx.sending.token.symbol)
        );
        this.transactions?.forEach( tx => {
            if(!this.tokensBought.find(t => t.token.coinKey === tx.receiving.token.coinKey)) {
                this.tokensBought.push({ token: tx.receiving.token, transactions: [], pnl: 0, totalBoughtUSD: 0, totalBought: 0});
            }
        });
        this.tokensBought = this.tokensBought.map( token => {
            token.transactions = this.transactions?.filter(
                tx => tx.receiving.token.coinKey === token.token.coinKey
            ) || [];
            return token;
        });
        
        
        // Collect all unique tokens (both receiving and sending) to fetch prices
        const allTokens = new Map<string, LifiToken>();
        this.tokensBought.forEach(data => {
            allTokens.set(`${data.token.chainId}_${data.token.address}`, data.token);
            data.transactions.forEach(tx => {
                allTokens.set(`${tx.sending.token.chainId}_${tx.sending.token.address}`, tx.sending.token);
                allTokens.set(`${tx.receiving.token.chainId}_${tx.receiving.token.address}`, tx.receiving.token);
            });
        });

        const tokenInfoObservables = Array.from(allTokens.values()).map(token => 
            this.lifiService.getTokenInformation(token.chainId.toString(), token.address)
        );

        forkJoin(tokenInfoObservables).subscribe(tokenInfos => {
            // Store all token info in the cache
            tokenInfos.forEach((tokenInfo) => {
                this.currentTokenInfoStore[`${tokenInfo.chainId}_${tokenInfo.address}`] = tokenInfo;
            });

            this.calculatePnlValues();
            this.getTotalPnl();
        });
    }

    private calculatePnlValues() {
        this.tokensBought.forEach(data => {
            data.totalBoughtUSD = 0;
            data.totalBought = 0;
            data.pnl = 0;
            data.transactions.forEach( tx => {
                tx.receiving.amount = (+tx.receiving.amount / Math.pow(10, tx.receiving.token.decimals)).toString();
                tx.sending.amount = (+tx.sending.amount / Math.pow(10, tx.sending.token.decimals)).toString();
                data.pnl += (+tx.receiving.amount * this.getTokenPriceUSD(tx.receiving.token) - +tx.receiving.amountUSD)
                    - (+tx.sending.amount * this.getTokenPriceUSD(tx.sending.token) - +tx.sending.amountUSD);
                data.totalBoughtUSD += +tx.receiving.amountUSD;
                data.totalBought += +tx.receiving.amount;
            });
        });
    }

    private resetData() {
        // TODO: Reset PnL data on logout
        console.log('Resetting PnL data...');
    }

    private getTokenPriceUSD(token: LifiToken): number {
        const cachedToken = this.currentTokenInfoStore[`${token.chainId}_${token.address}`];
        if (cachedToken) {
            return parseFloat(cachedToken.priceUSD || '0');
        }
        return 0;
    }

}
