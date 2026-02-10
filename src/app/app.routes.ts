import { Routes } from '@angular/router';
import { AaveComponent } from './aave/aave.component';
import { DefiPnlComponent } from './defi-pnl/defi-pnl.component';

export const routes: Routes = [
  { path: '', redirectTo: '/aave', pathMatch: 'full' },
  { path: 'aave', component: AaveComponent },
  { path: 'pnl', component: DefiPnlComponent },
];
