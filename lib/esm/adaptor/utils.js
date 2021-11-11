export function getAll(...docs) {
    return Promise.all(docs.map((doc) => doc.get()));
}
//# sourceMappingURL=utils.js.map