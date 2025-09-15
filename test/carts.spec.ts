import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('ServeRest API - Carts', () => {
    let token = '';
    let idProduto = '';
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://serverest.dev';
    const emailUsuario = faker.internet.email();
    const password = faker.string.numeric(9);

    p.request.setDefaultTimeout(90000);

    beforeAll(async () => {
        p.reporter.add(rep);

        await p
            .spec()
            .post(`${baseUrl}/usuarios`)
            .withJson({
                nome: faker.internet.username(),
                email: emailUsuario,
                password: password,
                administrador: 'true'
            })
            .expectStatus(StatusCodes.CREATED);

        token = await p
            .spec()
            .post(`${baseUrl}/login`)
            .withJson({
                email: emailUsuario,
                password: password
            })
            .expectStatus(StatusCodes.OK)
            .returns('authorization');

        idProduto = await p
            .spec()
            .post(`${baseUrl}/produtos`)
            .withHeaders('Authorization', token)
            .withJson({
                nome: faker.commerce.productName(),
                preco: 500,
                descricao: faker.commerce.productDescription(),
                quantidade: 10
            })
            .expectStatus(StatusCodes.CREATED)
            .returns('_id');
    });

    describe('POST /carrinhos', () => {
        it('should create a new cart with a product', async () => {
            await p
                .spec()
                .post(`${baseUrl}/carrinhos`)
                .withHeaders('Authorization', token)
                .withJson({
                    produtos: [
                        {
                            idProduto: idProduto,
                            quantidade: 2
                        }
                    ]
                })
                .expectStatus(StatusCodes.CREATED)
                .expectJsonLike({
                    message: 'Cadastro realizado com sucesso'
                });
        });
    });

    describe('GET /carrinhos', () => {
        it('should list all carts', async () => {
            await p
                .spec()
                .get(`${baseUrl}/carrinhos`)
                .withHeaders('Authorization', token)
                .expectStatus(StatusCodes.OK)
                .expectJsonSchema({ // Valida a estrutura da resposta
                    type: 'object',
                    properties: {
                        quantidade: { type: 'number' },
                        carrinhos: { type: 'array' }
                    }
                });
        });
    });

    describe('DELETE /carrinhos/concluir-compra', () => {
        it('should conclude the purchase and delete the cart', async () => {
            await p
                .spec()
                .delete(`${baseUrl}/carrinhos/concluir-compra`)
                .withHeaders('Authorization', token)
                .expectStatus(StatusCodes.OK)
                .expectJson({
                    message: 'Registro excluído com sucesso'
                });
        });
    });

    afterAll(() => p.reporter.end());
});