import { BillingService } from '../services';

export class CheckPaidPlanMiddleware {
  constructor(private readonly billingService: BillingService) {}
  public async handle(req: Request, res: Response) {
    if (!this.billingService.checkPaidUser(req.params.idUser)) {
      throw new Error('User cannot update own profile on free plan');
    }
  }
}
