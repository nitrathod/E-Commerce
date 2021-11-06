import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { UiModule } from '@frontend/ui'
//PrimeNG Module
import { AccordionModule } from 'primeng/accordion';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';


const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },
    {
        path: 'products',
        component: ProductListComponent
    }
];
@NgModule({
    declarations: [
        AppComponent, 
        HomePageComponent, 
        ProductListComponent, 
        FooterComponent, 
        HeaderComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule, 
        RouterModule.forRoot(routes),
        UiModule,
        AccordionModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
