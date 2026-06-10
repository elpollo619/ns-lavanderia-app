/* eslint-env jest */
// Mock oficial de AsyncStorage (almacenamiento en memoria para tests)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
