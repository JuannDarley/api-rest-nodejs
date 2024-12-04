import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		execSync('npm run knex migrate:rollback --all')
		execSync('npm run knex migrate:latest')
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

	it('should be able to get especific transactions', async () => {
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

		const transactionId = lsitTransactionsResponse.body.transactions[0].id

		const getTransactionsResponse = await request(app.server)
			.get(`/transactions/${transactionId}`)
			//@ts-expect-error: The error occurs because TypeScript cannot guarantee that the passed value is not undefined
			.set('Cookie', cookies)
			.expect(200)

		expect(getTransactionsResponse.body.transaction).toEqual(
			expect.objectContaining({
				title: 'New transactions',
				amount: 5000,
			}),
		)
	})

	it('should be able to get the summary', async () => {
		const createTransactionsResponse = await request(app.server)
			.post('/transactions')
			.send({
				title: 'Credit transaction',
				amount: 5000,
				type: 'credit',
			})

		const cookies = createTransactionsResponse.get('Set-Cookie')

		await request(app.server)
			.post('/transactions')
			//@ts-expect-error: The error occurs because TypeScript cannot guarantee that the passed value is not undefined
			.set('Cookie', cookies)
			.send({
				title: 'Debit transaction',
				amount: 2000,
				type: 'debit',
			})

		const summaryResponse = await request(app.server)
			.get('/transactions/summary')
			//@ts-expect-error: The error occurs because TypeScript cannot guarantee that the passed value is not undefined
			.set('Cookie', cookies)
			.expect(200)

		expect(summaryResponse.body.summary).toEqual({
			amount: 3000,
		})
	})
})
