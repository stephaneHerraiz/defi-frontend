import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EChartsCoreOption, VisualMapComponentOption } from 'echarts';
import { AaveMarketService } from './services/aave-market.service';
import { AaveMarketStatusInterface, GetAaveMarketStatusInterface } from './interfaces/aave-market-status.interface';

import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent } from 'echarts/components';
import { TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { DataZoomComponent } from 'echarts/components';
import { LegendComponent } from 'echarts/components';
import { VisualMapComponent } from 'echarts/components';
import { MarkAreaComponent } from 'echarts/components';
import { MarkPointComponent } from 'echarts/components';
import { CustomChart } from 'echarts/charts';
echarts.use([
  LineChart,
  GridComponent,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent, 
  DataZoomComponent,
  LegendComponent,
  VisualMapComponent,
  MarkAreaComponent,
  MarkPointComponent,
  CustomChart]);

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { AccountInterface } from './interfaces/account.interface';
import { AccountService } from './services/account.service';
import { forkJoin, map, mergeMap, Observable} from 'rxjs';
import { AaveMarketInterface } from './interfaces/aave-market.interface';
import { AaveTransactionActions, AaveTransactionInterface } from './interfaces/aave-transaction.interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AuthService } from './services/auth.service';
dayjs.extend(utc);

const COLORS = [ 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'gray', 'black', 'yellow' ];
const DEFAULT_OPTIONS: EChartsCoreOption = {
  title: {
    text: 'AAVE lending overview'
    
  },
  // grid: {
  //   top: 160,
  //   bottom: 125
  // },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      return [
        echarts.format.formatTime(
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
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    NgxEchartsModule, 
    MatSelectModule, 
    MatFormFieldModule, 
    FormsModule,  
    ReactiveFormsModule, 
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    provideEchartsCore({ echarts }),
  ]
})
export class AppComponent implements OnInit  {
  public options: EChartsCoreOption = DEFAULT_OPTIONS;
  data: AaveMarketStatusInterface[] = [];
  accounts: AccountInterface[] = [];
  markets: AaveMarketInterface[] = [];
  selectedAccount: AccountInterface | null = null;
  selectedMarkets: AaveMarketInterface[] = []; 
  // selectedMarkets = new FormControl([]);
  private aaveMarketService = inject(AaveMarketService);
  private accountService = inject(AccountService);
  isAuthenticated = false;
  userAddress: string | null = null;

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Subscribe to unauthorized events
    this.authService.unauthorized$.subscribe(() => {
      this.isAuthenticated = false;
    });

    if(this.authService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.userAddress = this.authService.getUserAddress();
      this.getAccountsAndMMarkets();
    }
  }

  login() {
    this.authService.signInWithMetaMask().subscribe({
      complete: () => {
        this.isAuthenticated = true;
        this.userAddress = this.authService.getUserAddress();
        this.getAccountsAndMMarkets();
        // this.navCtrl.navigateForward('/dashboard');
      },
      error: (err) => {
        console.log(err);
        this.isAuthenticated = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.userAddress = null;
    this.data = [];
    this.accounts = [];
    this.markets = [];
    this.selectedAccount = null;
    this.selectedMarkets = [];
    this.updateChart();
  }

  getAccountsAndMMarkets() {
    this.accountService.get()
    .pipe( 
      mergeMap((accounts: AccountInterface[]) => {
        this.accounts = accounts;
        this.selectedAccount = this.accounts[0];
        return this.aaveMarketService.getMarkets();
      }),
    )
    .subscribe( (markets: AaveMarketInterface[]) => {
      this.markets = markets;
      this.updateChart();
    });
  }

  selectAccount(event: any) {
    this.selectedAccount = event.value;
    this.updateChart();
  }

  selectMarket(event: any) {
    this.selectedMarkets = event.value;
    this.updateChart();
    
  }

  updateChart() {
    if (this.selectedMarkets.length === 0) {
      this.options = {
        ...this.options,
        series : [],
      };
      return;
    }

    const getMarketPromise: Observable<GetAaveMarketStatusInterface>[] = [];
    this.selectedMarkets.forEach((market: AaveMarketInterface) => {
      getMarketPromise.push(this.aaveMarketService.get(this.selectedAccount?.address, market.chain));
    });
    forkJoin(getMarketPromise).subscribe( (result: GetAaveMarketStatusInterface[]) => {
      const series: any[] = [] ;
      const legend :string[] = [];
      const visualMaps: VisualMapComponentOption[] = [];
      let index = 0;
      result.forEach((_marketStatus: GetAaveMarketStatusInterface) => {
        let serie = {
          type: 'line',
          name: _marketStatus.market || '',
          // lineStyle: { color: COLORS[index]},
          showSymbol: false,
          data: _marketStatus.data.map((marketStatus) => [
            dayjs(marketStatus.created_at).utc(true).startOf('hour').toDate(),
              // new Date(marketStatus.created_at),
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
        }
        series.push(serie);
        legend.push(serie.name || ''); // Add the market name to the legend
        // this.addAaveHistoryToSerie(serie).subscribe((serie: any) => {
        //   
        //   visualMaps.push(this.createVisualMap(index));
        //   this.options = {
        //     ...DEFAULT_OPTIONS,
        //     visualMap: visualMaps,
        //     series : series,
        //     legend: {
        //       data: legend,
        //       align: 'left',
        //     },
        //   };
        // });
        this.addAaveHistorySerie().subscribe((serie: any) => {
          series.push(serie);
          this.options = {
            ...DEFAULT_OPTIONS,
            visualMap: visualMaps,
            series : series,
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

  private createVisualMap(
    index: number
  ): VisualMapComponentOption { 
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

  private addAaveHistoryToSerie(serie: any) {
    const data: any[] = []
    return this.aaveMarketService.getTransactions(this.selectedAccount?.address, this.selectedMarkets[0].chain)
      .pipe(
        map( (transactions: AaveTransactionInterface[]) => {
        transactions.forEach((transaction: AaveTransactionInterface) => {
          // const date = new Date(transaction.timestamp * 1000).toLocaleString();
          const date = dayjs(transaction.timestamp * 1000).startOf('hour').toDate();
          const value = serie.data.find((_data: any) => {
              return _data[0].toISOString() == date.toISOString();
          });
          if (value) {
            data.push({
              xAxis: date,
              yAxis: value[1],
              value: transaction.action,
            });
          }
          
        });
          serie = {
            ...serie,
            markPoint : {
              data
            },
          };
           return serie;
        }),
      );
  }

  private renderHistory(param: any, api: any) {
    let position = 50;
    switch (api.value(2)) {
      case AaveTransactionActions.SUPPLY:
        position += 24;
        break;
      case AaveTransactionActions.BORROW:
        position += 24*2;
        break;
      case AaveTransactionActions.REPAY:
        position = +24*3;
        break;
      case AaveTransactionActions.WITHDRAW:
        position = +24*4;
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
      text = `${(api.value(3)*10**(-api.value(4))).toFixed(2)} ${api.value(5)}`;
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
  };

  private addAaveHistorySerie() {
    return this.aaveMarketService.getTransactions(this.selectedAccount?.address, this.selectedMarkets[0].chain)
      .pipe(
        map( (transactions: AaveTransactionInterface[]) => {
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
