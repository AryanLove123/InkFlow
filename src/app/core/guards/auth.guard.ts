import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { inject } from "@angular/core";
import { map, take } from "rxjs";

export const authGuard: CanActivateFn = (state) =>{
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
        take(1),
        map((user) =>{
            if(user){
                return true;
            }
            return router.createUrlTree(['.login'], {queryParams: {redirect: state.url}});
        })
    )
}