import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";


@Injectable()
export class jwtGuard extends AuthGuard('jwt'){
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log("jwtGuard");
        return super.canActivate(context);
    }
}