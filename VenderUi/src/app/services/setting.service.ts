import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SettingApi } from '../Constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private http: HttpClient) { }


  getSettings(): Observable<any> {
    return this.http.get(SettingApi.getSetting);
  }

 
  updateSettings(model: any): Observable<any> {
    return this.http.post(SettingApi.updateSetting, model);
  }
}