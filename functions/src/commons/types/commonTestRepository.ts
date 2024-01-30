import { DocumentData } from "firebase-admin/firestore";
import CommonRepository from "../common.repository";

type CommonTestRepositoryType<T extends DocumentData, TD> = CommonRepository<
  T,
  TD
> & {
  database: { [id: string]: any };
};

export default CommonTestRepositoryType;
