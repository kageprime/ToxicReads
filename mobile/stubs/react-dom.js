// React Native has no DOM. React 18 batches state updates automatically,
// so this is a safe pass-through for @tanstack/react-query's batching hook.
export const unstable_batchedUpdates = (fn, ...args) => fn(...args);

export default {unstable_batchedUpdates};
