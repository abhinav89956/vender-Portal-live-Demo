import { environment } from "../environment";

export class UserApi {
  static baseUrl = environment.apiUrl + '/User';
  static login = UserApi.baseUrl + '/login';
  static SignUp = UserApi.baseUrl + '/register';
  static sendOtp = UserApi.baseUrl + '/send-otp';
  static verifyOtp = UserApi.baseUrl + '/verify-otp';
  static resetPassword = UserApi.baseUrl + '/reset-password';
  static logout = UserApi.baseUrl + '/logout';  
}

export class ItemApi {

  static baseUrl = environment.apiUrl + '/Items';
  static getItems   = ItemApi.baseUrl + '/getall'; 
  static addItem    = ItemApi.baseUrl + '/add';
  static updateItem = ItemApi.baseUrl + '/update';
  static deleteItem = (id: number) => ItemApi.baseUrl + '/delete/' + id;
}

  export class VendorApi {

  static baseUrl = environment.apiUrl + '/Vendor';
  static getItems   = VendorApi.baseUrl + '/GetAllVenders'; 
  static addItem    = VendorApi.baseUrl + '/AddVendor';
  static updateItem = VendorApi.baseUrl + '/UpdateVendor';
  static deleteItem = (id: number) => VendorApi.baseUrl + '/DeleteVendor/' + id;
  static assignItems = VendorApi.baseUrl + '/AssignItems';
  static unAssignItems = VendorApi.baseUrl + '/UnAssignItems';
}
  export class BarCodeApi {
     static baseUrl = environment.apiUrl + '/BarCode';
      static getBarCodeItems   = BarCodeApi.baseUrl + '/GetVendorItems'; 
      static insertBarCode   = BarCodeApi.baseUrl + '/Generate'; 
      static GetBarCode   = BarCodeApi.baseUrl + '/GetBarcodes';
  static deleteBarCode = (id: number) =>

  BarCodeApi.baseUrl + '/' + id;

  }
    export class SettingApi{
 static baseUrl = environment.apiUrl + '/Setting';
   static getSetting= SettingApi.baseUrl + '/getst';
   static updateSetting= SettingApi.baseUrl + '/updatest';
   
    }

    export class DashboardApi {

  static baseUrl = environment.apiUrl + '/Dashboard';

  static getVendor = (userId: number) =>
    `${DashboardApi.baseUrl}/GetVendor/${userId}`;
}






export class ChatApi {

  static baseUrl = environment.apiUrl + '/Chat';

  static getContacts = (userId: number) =>
    `${ChatApi.baseUrl}/GetContacts?userId=${userId}`;

  static sendMessage = `${ChatApi.baseUrl}/SendMessage`;
  static markSeen = `${ChatApi.baseUrl}/MarkAsSeen`;

  static getMessages = (user1: number, user2: number) =>
    `${ChatApi.baseUrl}/GetMessages?user1=${user1}&user2=${user2}`;

 static blockUser = `${ChatApi.baseUrl}/BlockUser`;
 static GetblockUser = `${ChatApi.baseUrl}/GetBlockedUsers`;


  static updateStatus = `${ChatApi.baseUrl}/UpdateStatus`;

  static getNotifications = (userId: number) =>
    `${ChatApi.baseUrl}/GetNotifications?userId=${userId}`;


static hubUrl = 'https://localhost:44396'.replace(/\/$/, '') + '/chathub';
}