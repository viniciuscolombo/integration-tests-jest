import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Toolshop API', () => {
	const p = pactum;
	const rep = SimpleReporter;
	const baseUrl = 'https://api.practicesoftwaretesting.com';
	let brandId = '';

	p.request.setDefaultTimeout(30000);

	beforeAll(() => p.reporter.add(rep));
	afterAll(() => p.reporter.end());

	describe('Brands', () => {
		it('New Brand', async () => {
			brandId = await p
				.spec()
				.post(`${baseUrl}/brands`)
				.withJson({
					name: faker.company.name(),
					slug: faker.person.firstName().toLowerCase()
				})
				.expectStatus(StatusCodes.CREATED)
				.returns('id');
		});

		it('Get Brands', async () => {
			await p
				.spec()
				.get(`${baseUrl}/brands`)
				.expectStatus(StatusCodes.OK);
		});

		it('Get Brand by ID', async () => {
			await p
				.spec()
				.get(`${baseUrl}/brands/${brandId}`)
				.expectStatus(StatusCodes.OK)
				.expectJsonLike({
					id: brandId
				});
		});

		it('Update Brand by ID', async () => {
			const updatedBrandName = faker.company.name();
			const updatedSlug = updatedBrandName.toLowerCase().replace(/ /g, '-'); // Gera slug a partir do nome

			await p
				.spec()
				.put(`${baseUrl}/brands/${brandId}`)
				.withJson({
					id: brandId,
					name: updatedBrandName,
					slug: updatedSlug // Usa o novo slug
				})
				.expectStatus(StatusCodes.OK)
				.expectJson({
					success: true
				});
		});

		it('Patch Brand by ID', async () => {
			const patchedBrandName = faker.company.name();
			const patchedSlug = patchedBrandName.toLowerCase().replace(/ /g, '-'); // Gera slug a partir do nome

			await p
				.spec()
				.patch(`${baseUrl}/brands/${brandId}`)
				.withJson({
					name: patchedBrandName,
					slug: patchedSlug // Usa o novo slug
				})
				.expectStatus(StatusCodes.OK)
				.expectJson({
					success: true
				});
		});
	});

	describe('Search', () => {
		const brandToSearch = `TestBrand-${faker.string.uuid()}`;

		beforeAll(async () => {
			await p
				.spec()
				.post(`${baseUrl}/brands`)
				.withJson({
					name: brandToSearch,
					slug: brandToSearch.toLowerCase()
				})
				.expectStatus(StatusCodes.CREATED);
		});

		it('Search for a Brand by name', async () => {
			await p
				.spec()
				.get(`${baseUrl}/brands/search`)
				.withQueryParams('search', 'a')
				.expectStatus(StatusCodes.OK)
				.expectJsonSchema({
					type: 'array'
				});
		});
	});
});