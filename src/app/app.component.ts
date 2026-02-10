import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';
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

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    provideEchartsCore({ echarts }),
  ]
})
export class AppComponent implements OnInit  {
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
    }
  }

  login() {
    this.authService.signInWithMetaMask().subscribe({
      complete: () => {
        this.isAuthenticated = true;
        this.userAddress = this.authService.getUserAddress();
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
  }

}