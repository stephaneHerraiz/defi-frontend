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

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from './services/auth.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    ToolbarModule,
    ButtonModule,
    MenuModule,
    DialogModule,
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
  sidebarVisible = true;
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Subscribe to unauthorized events
    this.authService.unauthorized$.subscribe(() => {
      this.isAuthenticated = false;
      this.updateMenuItems();
    });

    if(this.authService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.userAddress = this.authService.getUserAddress();
    }
    
    this.updateMenuItems();
  }

  updateMenuItems(): void {
    if (!this.isAuthenticated) {
      this.menuItems = [
        {
          label: 'Connect',
          icon: 'pi pi-sign-in',
          command: () => this.login()
        }
      ];
    } else {
      this.menuItems = [
        {
          label: 'Disconnect',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ];
    }
  }

  login() {
    this.authService.signInWithMetaMask().subscribe({
      complete: () => {
        this.isAuthenticated = true;
        this.userAddress = this.authService.getUserAddress();
        this.updateMenuItems();
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
    this.updateMenuItems();
  }

}