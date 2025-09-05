/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// test-tcp.ts com tratamento de erro
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

async function test() {
  const client = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3334 },
  });

  try {
    console.log('Enviando mensagem...');
    const res = await client.send({ cmd: 'users_find_all' }, {}).toPromise();
    console.log('Sucesso:', res);
  } catch (error) {
    console.error('--- ERRO RECEBIDO DO MICROSSERVIÇO ---');
    console.error(error); // Agora o erro será exibido de forma controlada
    console.error('--------------------------------------');
  } finally {
    // Garante que a conexão seja fechada no final
    await client.close();
  }
}

test();
