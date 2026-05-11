import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';
import { AuthGuard } from './guards/auth.guard';
import { ItemsComponent } from './component/items/items.component';
import { VenderComponent } from './component/vender/vender.component';
import { BarcodeComponent } from './component/barcode/barcode.component';
import { BarcodeListComponent } from './component/barcode-list/barcode-list.component';
import { SettingsComponent } from './component/settings/settings.component';


import { ChatComponent } from './component/chat/chat.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
{ path: 'login', component: LoginComponent },
{ path: 'signup', component: SignUpComponent },
{ path: 'forget', component: ResetPasswordComponent },
{ path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
{ path: 'item', component: ItemsComponent, canActivate: [AuthGuard] },
{ path: 'vendor', component: VenderComponent, canActivate: [AuthGuard] },
{ path: 'barcode', component: BarcodeComponent, canActivate: [AuthGuard] },
{ path: 'barcodelist', component: BarcodeListComponent, canActivate: [AuthGuard] },
{ path: 'setting', component: SettingsComponent, canActivate: [AuthGuard] },
{ path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },






{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
