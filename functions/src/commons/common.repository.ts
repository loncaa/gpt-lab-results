import { firestore } from "firebase-admin";
import { db } from "../config/firebase";
import IRepository, {
  CreateEntityOptions,
  FirestoreWhereOptions,
  RepositoryOptions,
} from "./types/irepository";

export default class CommonRepository<
  T extends FirebaseFirestore.DocumentData,
  TDto
> implements IRepository
{
  constructor(private readonly collection: string) {}

  private async fetchBulkInBatches(
    ids: string[]
  ): Promise<FirebaseFirestore.QuerySnapshot<firestore.DocumentData>[]> {
    const fetchIds = [...ids];
    const promises = [];

    while (fetchIds.length) {
      const batchIds = fetchIds.splice(0, 10);

      promises.push(
        db.collection(this.collection).where("__name__", "in", batchIds).get()
      );
    }

    const flatArray = await Promise.all(promises).then((responses) =>
      responses.flat()
    );

    return flatArray;
  }

  create(payload: T, options?: CreateEntityOptions): TDto {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      return { id: null } as TDto;
    }

    const collection = db.collection(this.collection);
    let id = collection.doc().id;

    if (options) {
      if (options.customId) {
        id = options.customId;
      }
    }

    collection.doc(id).create(payload);

    const dataDto = {
      id,
      ...payload,
    } as TDto;

    return dataDto;
  }

  async createBatch(payloads: T[]): Promise<string[]> {
    // Get a new write batch
    const batch = db.batch();

    const ids: string[] = [];

    payloads.forEach((payload) => {
      const ref = db.collection(this.collection).doc();
      ids.push(ref.id);

      batch.set(ref, payload);
    });

    // Commit the batch
    await batch.commit();
    return ids;
  }

  async fetchData(id: string): Promise<TDto | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (doc.exists) {
      const data = doc.data() as T;
      const dataDto = {
        id: doc.id,
        ...data,
      } as TDto;
      return dataDto;
    }

    return null;
  }

  mapDocumentToDto(
    document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ): TDto {
    const data = document.data() as T;
    const dataDto = {
      id: document.id,
      ...data,
    } as TDto;

    return dataDto;
  }

  async fetchDocument(
    id: string
  ): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null> {
    const doc = await db.collection(this.collection).doc(id).get();
    if (doc.exists) {
      return doc;
    }

    return null;
  }

  async update(id: string, payload: Partial<T>): Promise<string | null> {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      return id;
    }

    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      return null;
    }

    await doc.ref.update(payload);
    return id;
  }

  remove(id: string): string {
    db.collection(this.collection).doc(id).delete();
    return id;
  }

  mapDocumentsToDto(
    documents: firestore.QuerySnapshot<firestore.DocumentData>
  ): TDto[] {
    const response: TDto[] = [];
    documents.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data() as T;
        const dataDto = {
          id: doc.id,
          ...data,
        } as TDto;
        response.push(dataDto);
      }
    });

    return response;
  }

  async checkIfEntitiesExist(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) {
      return false;
    }

    const documents = await this.fetchBulkInBatches(ids);
    const documentsSize = documents.reduce((acc, doc) => acc + doc.size, 0);

    if (documentsSize === 0) {
      return false;
    }

    if (ids.length !== documentsSize) {
      return false;
    }

    return true;
  }

  async checkIfEntityExist(id: string): Promise<boolean> {
    const document = await db.collection(this.collection).doc(id).get();

    if (!document || !document.exists) {
      return false;
    }

    return true;
  }

  async fetchBulkData(ids: string[]): Promise<TDto[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const documents = await this.fetchBulkInBatches(ids);

    if (documents.length !== 0) {
      const dtos = documents.map((doc) => this.mapDocumentsToDto(doc)).flat();
      return dtos;
    }

    return [];
  }

  async queryAll(
    where: FirestoreWhereOptions[],
    options?: RepositoryOptions
  ): Promise<TDto[]> {
    const sort = options?.sort
      ? options.sort
      : {
          fieldPath: "__name__",
          directionStr: "asc" as firestore.OrderByDirection,
        };

    let documentData = db
      .collection(this.collection)
      .orderBy(sort.fieldPath, sort.directionStr);

    if (options) {
      const { startAfterDocument, count } = options;
      if (startAfterDocument && startAfterDocument.exists) {
        documentData = documentData.startAfter(startAfterDocument);
      }

      if (count) {
        documentData = documentData.limit(count);
      }
    }

    if (where && where.length > 0) {
      where.forEach((w) => {
        documentData = documentData.where(w.fieldPath, w.opStr, w.value);
      });
    }

    const documents = await documentData.get();

    if (!documents.empty) {
      return this.mapDocumentsToDto(documents);
    }

    return [];
  }
}
