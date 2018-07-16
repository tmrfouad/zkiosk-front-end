import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NavComponent } from './components/nav/nav.component';
import { SharedModule } from '../shared/shared.module';
import { LogOutComponent } from './components/log-out/log-out.component';
import { LogInComponent } from './components/log-in/log-in.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'login', component: LogInComponent }
    ])
  ],
  declarations: [
    HomeComponent,
    NavbarComponent,
    SideNavbarComponent,
    BreadcrumbComponent,
    NavComponent,
    LogOutComponent,
    LogInComponent
  ],
  exports: [
    NavComponent,
    BreadcrumbComponent
  ],
  entryComponents: [
    LogOutComponent
  ]
})
export class CoreModule { }
