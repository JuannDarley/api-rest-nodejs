import { it, beforeAll, afterAll, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('Transactions routes', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('should be able to create a new transaction', async () => {
		await request(app.server)
			.post('/transactions')
			.send({
				title: 'New transactions',
				amount: 5000,
				type: 'credit',
			})
			.expect(201)
	})

	it('should be able to list all transactions', async () => {
		const createTransactionsResponse = await request(app.server)
			.post('/transactions')
			.send({
				title: 'New transactions',
				amount: 5000,
				type: 'credit',
			})

		const cookies = createTransactionsResponse.get('Set-Cookie')

		const lsitTransactionsResponse = await request(app.server)
			.get('/transactions')
			//@ts-expect-error: The error occurs because TypeScript cannot guarantee that the passed value is not undefined
			.set('Cookie', cookies)
			.expect(200)

		expect(lsitTransactionsResponse.body.transactions).toEqual([
			expect.objectContaining({
				title: 'New transactions',
				amount: 5000,
			}),
		])
	})
})
