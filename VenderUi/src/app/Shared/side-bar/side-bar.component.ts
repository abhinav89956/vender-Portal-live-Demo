import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {

  showSidebar: boolean = true;

  // Barcode
  barcodeMenuOpen: boolean = false;
  isBarcodeRouteActive: boolean = false;

  // Settings
  settingMenuOpen: boolean = false;
  isSettingRouteActive: boolean = false;

  venderCode: string = '';
  isAdmin: boolean = false;
chatMenuOpen = false;
isChatRouteActive = false;

toggleChatMenu() {
  this.chatMenuOpen = !this.chatMenuOpen;
}
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private loginService: LoginService
  ) {

    this.loadUserData();
    this.checkRoute(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUserData();
        this.checkRoute(event.urlAfterRedirects);
      }
    });
  }

  private loadUserData() {
    this.venderCode = this.loginService.getVenderCode() || 'Admin';
    const userId = this.loginService.getUserId();
    this.isAdmin = userId === 23;
  }
  toggleBarcodeMenu() {
    this.barcodeMenuOpen = !this.barcodeMenuOpen;
  }

  toggleSettingMenu() {
    this.settingMenuOpen = !this.settingMenuOpen;
  }

  private checkRoute(url: string) {

    const hideRoutes = ['/login', '/signup', '/forget'];

    this.showSidebar = !hideRoutes.some(route =>
      url === route || url.includes(route)
    );

    
    this.isBarcodeRouteActive =
      url.includes('/barcode') || url.includes('/barcodelist');

    if (this.isBarcodeRouteActive) {
      this.barcodeMenuOpen = true;
    }


    this.isSettingRouteActive =
      url.includes('/update-setting') || url.includes('/event-log');

    if (this.isSettingRouteActive) {
      this.settingMenuOpen = true;
    }
  }

  logout() {
    if (this.loginService.isLoggedIn()) {

      this.toastr.success('You have successfully logged out!', 'Logout');

      setTimeout(() => {
        this.loginService.logout();
        this.router.navigate(['/login']);
      }, 800);

    } else {
      this.router.navigate(['/login']);
    }
  }
}