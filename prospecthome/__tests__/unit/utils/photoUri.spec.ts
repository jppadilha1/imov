import { resolvePhotoUri } from '../../../utils/photoUri';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock-doc-dir/',
}));

describe('resolvePhotoUri', () => {
  it('retorna URL https direto sem prefixar documentDirectory', () => {
    const url = 'https://supabase.example.com/storage/v1/.../photo.jpg?token=xyz';
    expect(resolvePhotoUri(url)).toBe(url);
  });

  it('retorna URL http direto sem prefixar documentDirectory', () => {
    const url = 'http://localhost:54321/storage/photo.jpg';
    expect(resolvePhotoUri(url)).toBe(url);
  });

  it('prefixa documentDirectory quando recebe filename local', () => {
    expect(resolvePhotoUri('1234-abc.jpg')).toBe('file:///mock-doc-dir/1234-abc.jpg');
  });

  it('prefixa documentDirectory para arquivos com extensões variadas', () => {
    expect(resolvePhotoUri('foto.png')).toBe('file:///mock-doc-dir/foto.png');
    expect(resolvePhotoUri('foto.heic')).toBe('file:///mock-doc-dir/foto.heic');
  });
});
