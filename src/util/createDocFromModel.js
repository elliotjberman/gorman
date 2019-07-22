export default function createDoc(modelInstance, isNew) {
  const doc = {};

  const allSchema = {...modelInstance.schema, ...modelInstance.parentRelationalSchema};
  Object.keys(allSchema).forEach(key => {
    const expectedType = allSchema[key];
    const value = modelInstance[key];
    if(!value instanceof expectedType)
      throw Error(`Schema error: key '${key}' is of type ${typeof value}, not ${expectedType}`)

    doc[key] = value;
  });

  return doc;
}
