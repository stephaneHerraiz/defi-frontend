import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsCoreOption, VisualMapComponentOption } from 'echarts';
import * as echarts from 'echarts/core';
import { AaveMarketService } from '../services/aave-market.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { WalletSelectionComponent } from '../wallet-selection/wallet-selection.component';
import { AccountInterface } from '../interfaces/account.interface';
import { AccountService } from '../services/account.service';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
import { AaveTransactionActions, AaveTransactionInterface } from '../interfaces/aave-transaction.interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AuthService } from '../services/auth.service';
import { AaveChainInterface, AaveMarketInterface, GetAaveMarketHistoryInterface, PortfolioRiskResultInterface, UnderlyingToken } from '../interfaces/aave-market';
import { AaveUserSuppliesInterface } from '../interfaces/aave-user.interface';
dayjs.extend(utc);

const COLORS = [ 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'gray', 'black', 'yellow' ];
const DEFAULT_OPTIONS: EChartsCoreOption = {
  title: {
    text: 'AAVE lending overview'
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      return [
        (echarts as any).format.formatTime(
          'yyyy-MM-dd hh:mm:ss',
          params[0].value[0]
        ) +
          ' ' +
          params[0].value[1].toFixed(2)
      ].join('<br>');
    },
    axisPointer: {
      animation: false,
    },
  },
  dataZoom: [
    {
      type: 'slider',
      xAxisIndex: 0,
      filterMode: 'empty',
    },
    {
      type: 'slider',
      yAxisIndex: 0,
      filterMode: 'empty',
    },
    {
      type: 'inside',
      xAxisIndex: 0,
      filterMode: 'empty',
    },
    {
      type: 'inside',
      yAxisIndex: 0,
      filterMode: 'empty',
    },
  ],
  xAxis: {
    type: 'time',
    axisLabel: {
      formatter: '{yy}-{MM}-{dd} {HH}h',
    },
    splitLine: {
      show: true,
    },
  },
  yAxis: [{
    type: 'value',
    min: 1,
    boundaryGap: [0, '100%'],
    splitLine: {
      show: true,
    },
  },
  {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false }
  }
  ],
  series: []
};

@Component({
  selector: 'app-aave',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    WalletSelectionComponent,
    CardModule,
    AccordionModule,
    SliderModule,
    PanelModule,
    SkeletonModule,
  ],
  templateUrl: './aave.component.html',
  styleUrl: './aave.component.scss'
})
export class AaveComponent implements OnInit {
  public options: EChartsCoreOption = DEFAULT_OPTIONS;
  accounts: AccountInterface[] = [];
  userChains: AaveChainInterface[] = [];
  selectedAccount: AccountInterface | null = null;
  selectedUserChain: AaveChainInterface | null = null;
  reservesInfo: UnderlyingToken[] = [];
  customBorrowUSD = 0;
  
  private aaveMarketService = inject(AaveMarketService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  selectedMarket: AaveMarketInterface | null = null;
  portfolioRiskResult: PortfolioRiskResultInterface | null = null;
  supplies: AaveUserSuppliesInterface[] = [];

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.getAccountsAndMarkets();
    }

    // Subscribe to authentication changes
    this.authService.unauthorized$.subscribe(() => {
      this.resetData();
    });

    this.authService.logged$.subscribe(() => {
      this.getAccountsAndMarkets();
    });
  }

  private resetData() {
    this.accounts = [];
    this.userChains = [];
    this.selectedAccount = null;
    this.selectedUserChain = null;
  }

  getAccountsAndMarkets() {
    this.accountService.get()
      .pipe(
        mergeMap((accounts: AccountInterface[]) => {
          this.accounts = accounts;
          this.selectedAccount = this.accounts[0];
          return this.aaveMarketService.getChains();
        }),
      )
      .subscribe((chains: AaveChainInterface[]) => {
        this.userChains = chains;
      });
  }

  selectAccount(event: any) {
    this.selectedAccount = event.value;
    if (this.selectedUserChain) {
      this.aaveMarketService.getMarket(this.selectedUserChain?.chainId, this.selectedAccount?.address || '').subscribe((market) => {
        this.reservesInfo = market.reserves.map(r => r.underlyingToken);
        this.selectedMarket = market;
        this.customBorrowUSD = this.selectedMarket.totalDebtBase;
        this.getPortfolioRiskManagement(market);
      });
    }
  }

  selectChain(event: any) {
    this.selectedUserChain = event.value;
    this.aaveMarketService.getMarket(event.value.chainId, this.selectedAccount?.address || '').subscribe((market) => {
      this.reservesInfo = market.reserves.map(r => r.underlyingToken);
      this.selectedMarket = market;
      this.customBorrowUSD = this.selectedMarket.totalDebtBase;
      this.getPortfolioRiskManagement(market);
    });
    
  }

  getPortfolioRiskManagement(market: AaveMarketInterface) {
    if (this.selectedAccount !== null && market !== null && this.selectedUserChain !== null) {
      const userAddress = this.authService.getUserAddress();
      if(!userAddress) {
        return;
      }
      forkJoin({
        supplies: this.aaveMarketService.getUserSupplies(this.selectedAccount.address, this.selectedUserChain.chainId, market),
        riskManagement: this.aaveMarketService.getMarketRiskManagement(
          this.selectedAccount.address,
          this.selectedUserChain, 
          market)
      }).subscribe(({ supplies, riskManagement }) => {
          this.portfolioRiskResult = riskManagement;
          this.supplies = supplies;
      })
    }
  }

  getReservesInfo(tokenAddress: string): UnderlyingToken | undefined  {
    return this.reservesInfo.find((reserve) => reserve.address.toLowerCase() === tokenAddress.toLowerCase());
  }

  updateChart() {
    if (this.selectedUserChain) {
      this.options = {
        ...this.options,
        series: [],
      };
      return;
    }

    const getMarketPromise: Observable<GetAaveMarketHistoryInterface>[] = [];
    // this.selectedUserChain.forEach((market: AaveChainInterface) => {
    //   getMarketPromise.push(this.aaveMarketService.get(this.selectedAccount?.address, market.chain));
    // });
    
    forkJoin(getMarketPromise).subscribe((result: GetAaveMarketHistoryInterface[]) => {
      const series: any[] = [];
      const legend: string[] = [];
      const visualMaps: VisualMapComponentOption[] = [];
      let index = 0;
      
      result.forEach((_marketStatus: GetAaveMarketHistoryInterface) => {
        let serie = {
          type: 'line',
          name: _marketStatus.market || '',
          showSymbol: false,
          data: _marketStatus.data.map((marketStatus) => [
            dayjs(marketStatus.created_at).utc(true).startOf('hour').toDate(),
            marketStatus.healthFactor,
          ]),
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: [
              [
                {
                  name: 'Alert threshold',
                  yAxis: 3.5,
                },
                {
                  yAxis: 1
                }
              ]
            ]
          }
        };
        
        series.push(serie);
        legend.push(serie.name || '');
        
        this.addAaveHistorySerie().subscribe((serie: any) => {
          series.push(serie);
          this.options = {
            ...DEFAULT_OPTIONS,
            visualMap: visualMaps,
            series: series,
            legend: {
              data: legend,
              align: 'left',
            },
          };
        });
        index++;
      });
    });
  }

  private createVisualMap(index: number): VisualMapComponentOption {
    return {
      show: false,
      seriesIndex: index,
      inRange: {
        color: 'red',
      },
      outOfRange: {
        color: COLORS[index],
      },
      pieces: [
        {
          gt: 0,
          lte: 3.5,
        },
      ],
    };
  }

  private renderHistory(param: any, api: any) {
    let position = 50;
    switch (api.value(2)) {
      case AaveTransactionActions.SUPPLY:
        position += 24;
        break;
      case AaveTransactionActions.BORROW:
        position += 24 * 2;
        break;
      case AaveTransactionActions.REPAY:
        position = +24 * 3;
        break;
      case AaveTransactionActions.WITHDRAW:
        position = +24 * 4;
        break;
      default:
        position = 1000;
        break;
    }
    const point = api.coord([
      api.value(0),
      0
    ]);
    let text = '';
    if (api.value(4)) {
      text = `${(api.value(3) * 10 ** (-api.value(4))).toFixed(2)} ${api.value(5)}`;
    }

    return {
      type: 'group',
      children: [{
        type: 'text',
        style: {
          text: `${api.value(2)}`,
          textFont: api.font({ fontSize: 10, fontWeight: 'bold' }),
          textAlign: 'center',
          textVerticalAlign: 'center',
        },
        position: [point[0], position],
      },
      {
        type: 'text',
        style: {
          text: text,
          textFont: api.font({ fontSize: 10 }),
          textAlign: 'center',
          textVerticalAlign: 'center',
        },
        position: [point[0], position + 12],
      }],
    };
  }

  private addAaveHistorySerie() {
    return this.aaveMarketService.getTransactions(this.selectedAccount?.address)
      .pipe(
        map((transactions: AaveTransactionInterface[]) => {
          return {
            type: 'custom',
            renderItem: this.renderHistory,
            yAxisIndex: 1,
            z: 11,
            data: transactions.map((transaction) => [
              dayjs(transaction.timestamp * 1000).startOf('hour').toDate(),
              0,
              transaction.action,
              transaction.amount,
              transaction.reserve?.decimals,
              transaction.reserve?.symbol,
            ]),
          };
        }),
      );
  }
}
