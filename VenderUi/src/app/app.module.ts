import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // ✅ FIXED

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { JwtInterceptor } from './Jwt/jwt.interceptor';
import { SideBarComponent } from './Shared/side-bar/side-bar.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { ResetPasswordComponent } from './component/reset-password/reset-password.component';

import { ToastrModule } from 'ngx-toastr';
import { ItemsComponent } from './component/items/items.component';
import { VenderComponent } from './component/vender/vender.component';
import { BarcodeComponent } from './component/barcode/barcode.component';
import { BarcodeListComponent } from './component/barcode-list/barcode-list.component';
import { SettingsComponent } from './component/settings/settings.component';

import { ChatComponent } from './component/chat/chat.component';

import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideBarComponent,
    DashboardComponent,
    SignUpComponent,
    ResetPasswordComponent,
    ItemsComponent,
    VenderComponent,
    BarcodeComponent,
    BarcodeListComponent,
    SettingsComponent,

    ChatComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
      QuillModule.forRoot(),
    HttpClientModule,
    RouterModule,
      PickerModule,
    AppRoutingModule,
     PickerModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
