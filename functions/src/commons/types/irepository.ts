import { firestore } from "firebase-admin";

interface IRepository<T = any, TDto = any> {
  create: (payload: T, options?: CreateEntityOptions) => TDto;
  createBatch: (payloads: T[]) => Promise<string[]>;
  update: (id: string, payload: Partial<T>) => Promise<string | null>;
  remove: (id: string) => string;
  fetchData: (id: string) => Promise<TDto | null>;
  fetchBulkData: (ids: string[]) => Promise<TDto[]>;
  queryAll: (
    where: FirestoreWhereOptions[],
    options?: RepositoryOptions
  ) => Promise<TDto[]>;
  fetchDocument: (
    id: string
  ) => Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null>;
  checkIfEntitiesExist(ids: string[]): Promise<boolean>;
  checkIfEntityExist(id: string): Promise<boolean>;

  mapDocumentToDto(
    document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ): TDto;
}
export default IRepository;

export interface FirestoreWhereOptions {
  fieldPath: string | firestore.FieldPath;
  opStr: firestore.WhereFilterOp;
  value: string | string[] | boolean;
}

export interface FirestoreOrderByOptions {
  fieldPath: string | firestore.FieldPath;
  directionStr: firestore.OrderByDirection;
}

export interface FilterByValues {
  fieldPath: string | firestore.FieldPath;
  value: string;
}

export interface RepositoryOptions {
  count?: number;
  startAfterDocument?: firestore.DocumentSnapshot;
  sort?: FirestoreOrderByOptions;
}

export interface CreateEntityOptions {
  customId?: string;
}
