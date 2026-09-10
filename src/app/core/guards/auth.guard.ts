import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { inject } from "@angular/core";
import { filter, map, take } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";

export const authGuard: CanActivateFn = (state) =>{
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.authReady).pipe(
    filter((ready) => ready),
    take(1),
    map(() =>
      authService.currentUserSignal()
        ? true
        : router.createUrlTree(['/'], { queryParams: { redirect: state.url } })
    )
  );

}