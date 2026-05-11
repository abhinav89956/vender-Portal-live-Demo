import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardApi } from '../Constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getVendor(userId: number): Observable<any> {
    return this.http.get(DashboardApi.getVendor(userId));
  }
}