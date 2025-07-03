import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { EspirituComponent } from './espiritu/espiritu.component';
import { CardenasComponent } from './cardenas/cardenas.component';
import { GodoyComponent } from './godoy/godoy.component';
import { MezaComponent } from './meza/meza.component';
import { RamirezComponent } from './ramirez/ramirez.component';
import { VeliComponent } from './veli/veli.component';

export const routes: Routes = [
    { path: '', redirectTo: 'cardenas', pathMatch: 'full' }, // Página principal es cardenas
    { path: 'home', component: HomeComponent },              // Puedes entrar a /home normalmente
    { path: 'navbar', component: NavbarComponent },
    { path: 'cardenas', component: CardenasComponent },
    { path: 'espiritu', component: EspirituComponent },
    { path: 'godoy', component: GodoyComponent },
    { path: 'meza', component: MezaComponent },
    { path: 'ramirez', component: RamirezComponent },
    { path: 'veli', component: VeliComponent }
];
