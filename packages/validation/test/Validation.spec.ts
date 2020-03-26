import { expect } from 'chai';
import * as Ajv from 'ajv';
import { isString } from '@uzert/helpers';
import { keywords, validateResponse } from '../src/utils';
import { ObjectId } from 'bson';
import { createResponse } from './utils';
import SchemasGenerator from '../src/SchemaGenerator';
import * as SwaggerParser from 'swagger-parser';
import { SHARED_TYPES, SWAGGER_OPTIONS, ROUTE_DATA } from './constants';

describe('Validation', () => {
	const ajv = Ajv({
		removeAdditional: true,
		useDefaults: true,
		coerceTypes: true,
		allErrors: true,
		nullable: true,
	});

	ajv.addKeyword('objectId', keywords.objectId);

	describe('Custom keyword', () => {
		const schema = {
			type: 'object',
			additionalProperties: false,
			properties: {
				nestedObject: {
					type: 'object',
					properties: {
						foo: { type: 'string' },
					},
				},
				string: {
					type: 'string',
				},
			},
		};

		const _id = new ObjectId();
		const idString = _id.toHexString();

		it('should coerce from string to ObjectId', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					_id: {
						type: ['object', 'string'],
						objectId: true
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				_id: idString,
				string: 'hello world',
			};

			expect(typeof data._id).eq('string');
			expect(compiler(data), 'Should compile schema').eq(true);
			expect(typeof data._id).eq('object');
			expect(_id.equals(data._id)).eq(true);
		});

		it('should coerce from ObjectId to string', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					_id: {
						type: ['object', 'string'],
						objectId: false
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				_id,
				string: 'hello world',
			};

			expect(typeof data._id).eq('object');
			expect(compiler(data), 'Should compile schema').eq(true);
			expect(isString(data._id), 'ID should be string').eq(true);
			expect(data._id).eq(idString);
		});

		it('should convert expanded data to ObjectId', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					_id: {
						type: ['object', 'string'],
						objectId: true,
						properties: {
							_id: {
								type: ['object', 'string'],
								objectId: false,
							},
							foo: {
								type: 'string',
							},
						},
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				_id: {
					_id: idString,
					foo: 'bar',
				},
				string: 'hello world',
			};

			expect(data._id).property('_id');
			expect(data._id).property('foo');

			expect(compiler(data), 'Should compile schema').eq(true);

			expect(data._id).not.property('_id');
			expect(data._id).not.property('foo');
			// @ts-ignore
			expect(_id.equals(data._id)).eq(true);
		});

		it('should miss expanded data if objectId: false', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					_id: {
						type: ['object', 'string'],
						objectId: false,
						properties: {
							_id: {
								type: ['object', 'string'],
								objectId: false,
							},
							foo: {
								type: 'string',
							},
						},
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				_id: {
					_id,
					foo: 'bar',
				},
				string: 'hello world',
			};

			expect(typeof data._id).eq('object');
			expect(data._id).property('_id');
			expect(data._id).property('foo');

			expect(compiler(data), 'Should compile schema').eq(true);

			expect(data._id).property('_id').eq(_id.toHexString());
			expect(data._id).property('foo');
		});

		it('should transform any field to ObjectId', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					academy: {
						type: ['object', 'string'],
						objectId: true,
						additionalProperties: false,
						properties: {
							_id: {
								type: ['object', 'string'],
								objectId: false,
							},
							foo: {
								type: 'string',
							},
						},
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				academy: {
					_id: idString,
					foo: 'bar',
				},
				string: 'hello world',
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data.academy).not.property('_id');
		});

		it('should transform any field to string', () => {
			const compiler = ajv.compile({
				...schema,
				properties: {
					...schema.properties,
					academy: {
						type: ['object', 'string'],
						additionalProperties: false,
						objectId: false,
						properties: {
							id: {
								type: ['object', 'string'],
							},
							_id: {
								type: 'string',
							},
							foo: {
								type: 'string',
							},
							user: {
								type: ['object', 'string'],
								objectId: false,
							}
						},
					},
				},
			});

			const data = {
				nestedObject: {
					foo: 'bar',
				},
				academy: _id,
				string: 'hello world',
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data.academy).not.property('_id');
			expect(data.academy).eq(idString);
		});

		it('should transform array of ObjectId to string', () => {
			const compiler = ajv.compile({
				type: 'object',
				additionalProperties: false,
				properties: {
					array: {
						type: 'array',
						items: {
							type: ['object', 'string'],
							objectId: false,
						},
					},
				},
			});

			const data = {
				array: [
					new ObjectId(),
					new ObjectId(),
					new ObjectId(),
				],
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data).property('array').an('array').length(3);

			data.array.forEach((item) => {
				expect(typeof item).eq('string');
			});
		});

		it('should transform array of string to ObjectId', async () => {
			const compiler = ajv.compile({
				type: 'object',
				additionalProperties: false,
				properties: {
					array: {
						type: 'array',
						items: {
							type: ['object', 'string'],
							objectId: true,
						},
					},
				},
			});

			const data = {
				array: [
					new ObjectId().toHexString(),
					new ObjectId().toHexString(),
					new ObjectId().toHexString(),
				],
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data).property('array').an('array').length(3);

			data.array.forEach((item) => {
				expect(item).instanceOf(ObjectId);
			});
		});

		it('should transform array of objects with _id ObjectId to string', () => {
			const compiler = ajv.compile({
				type: 'object',
				additionalProperties: false,
				properties: {
					array: {
						type: 'array',
						items: {
							type: ['object', 'string'],
							objectId: false,
						},
					},
				},
			});

			const data = {
				array: [
					{
						_id: new ObjectId(),
					},
					{
						_id: new ObjectId(),
					},
					{
						_id: new ObjectId(),
					},
				],
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data).property('array').an('array').length(3);

			data.array.forEach((item) => {
				expect(typeof item._id).eq('string');
			});
		});

		it('should transform array of objects with _id string to ObjectId', () => {
			const compiler = ajv.compile({
				type: 'object',
				additionalProperties: false,
				properties: {
					array: {
						type: 'array',
						items: {
							type: ['object', 'string'],
							objectId: true,
						},
					},
				},
			});

			const data = {
				array: [
					{
						_id: new ObjectId().toHexString(),
					},
					{
						_id: new ObjectId().toHexString(),
					},
					{
						_id: new ObjectId().toHexString(),
					},
				],
			};

			expect(compiler(data), 'Should compile schema').eq(true);
			expect(data).property('array').an('array').length(3);

			data.array.forEach((item) => {
				expect(item).instanceOf(ObjectId);
			});
		});

	});

	describe('Validate response', () => {
		/*
		*  User
		* */
		const schemaUser = {
			type: 'object',
			additionalProperties: false,
			properties: {
				role: {
					type: 'string',
				},
				userProperty: {
					type: 'string',
				},
			},
		};
		const payloadObjectUser = {
			role: 'user',
			userProperty: 'user',
		};

		/*
		*  Coach
		* */
		const schemaCoach = {
			type: 'object',
			additionalProperties: false,
			properties: {
				role: {
					type: 'string',
				},
				coachProperty: {
					type: 'string',
				},
			},
		};
		const payloadObjectCoach = {
			role: 'coach',
			coachProperty: 'coach',
		};

		/*
		*  Array
		* */
		const listResponse = (schema: any) => {
			return {
				type: 'object',
				additionalProperties: false,
				required: ['hasMore', 'data'],
				properties: {
					hasMore: {
						type: 'boolean',
					},
					data: {
						type: 'array',
						items: schema,
					},
					totalCount: {
						type: 'integer',
					},
				},
			};
		};

		const listSchema = {
			type: 'object',
			additionalProperties: false,
			required: ['hasMore', 'data'],
			properties: {
				hasMore: {
					type: 'boolean',
				},
				data: {
					type: 'array',
				},
				totalCount: {
					type: 'integer',
				},
			},
		};

		it('should validate response', () => {
			const schema = {
				200: schemaUser
			};

			const res = createResponse({
				response: schema,
			});

			const payload = {
				...payloadObjectUser,
				extra: 'property',
			};

			expect(payload).property('extra');
			const validatedPayload = validateResponse(ajv, {} as any, res as any, payload);
			expect(validatedPayload).not.property('extra');
		});

		it('should validate extend simple object response', () => {
			const schema = {
				200: {
					extends: {
						key: 'role',
						schemas: {
							user: schemaUser,
							coach: schemaCoach,
						},
					},
				},
			};

			const res = createResponse({
				response: schema,
			});

			// check user schema
			const payloadUser = {
				...payloadObjectUser,
				extra: 'property',
			};

			expect(payloadUser).property('extra');
			const validatedPayloadUser = validateResponse(ajv, {} as any, res as any, payloadUser);
			expect(validatedPayloadUser).not.property('coachProperty');
			expect(validatedPayloadUser).property('userProperty').eq(payloadObjectUser.userProperty);
			expect(validatedPayloadUser).not.property('extra');

			// check coach schema
			const payloadCoach = {
				...payloadObjectCoach,
				extra: 'property',
			};

			expect(payloadCoach).property('extra');
			const validatedPayloadCoach = validateResponse(ajv, {} as any, res as any, payloadCoach);
			expect(validatedPayloadCoach).property('coachProperty').eq(payloadObjectCoach.coachProperty);
			expect(validatedPayloadCoach).not.property('userProperty');
			expect(validatedPayloadCoach).not.property('extra');
		});

		it('should validate extend array response', () => {
			const schema = {
				200: {
					extends: {
						key: 'role',
						listSchema,
						schemas: {
							user: schemaUser,
							coach: schemaCoach,
						},
					},
				},
			};

			const res = createResponse({
				response: schema,
			});

			// check user schema
			const payloadUser = {
				hasMore: false,
				data: [
					{
						...payloadObjectUser,
						coachProperty: 'coach',
						extra: 'property',
					}
				],
			};

			expect(payloadUser).property('hasMore');
			expect(payloadUser).property('data').an('array').length(1);
			const validatedPayloadUser = validateResponse(ajv, {} as any, res as any, payloadUser);
			expect(validatedPayloadUser).property('hasMore');
			expect(validatedPayloadUser).property('data').an('array').length(1);
			const [user] = validatedPayloadUser.data;
			expect(user).not.property('extra');
			expect(user).not.property('coachProperty');
			expect(user).property('userProperty').eq(payloadObjectUser.userProperty);

			// check user schema
			const payloadCoach = {
				hasMore: false,
				data: [
					{
						...payloadObjectCoach,
						userProperty: 'user',
						extra: 'property',
					}
				],
			};

			expect(payloadCoach).property('hasMore');
			expect(payloadCoach).property('data').an('array').length(1);
			const validatedPayloadCoach = validateResponse(ajv, {} as any, res as any, payloadCoach);
			expect(validatedPayloadCoach).property('hasMore');
			expect(validatedPayloadCoach).property('data').an('array').length(1);
			const [coach] = validatedPayloadCoach.data;
			expect(coach).not.property('extra');
			expect(coach).not.property('userProperty');
			expect(coach).property('coachProperty').eq(payloadObjectCoach.coachProperty);
		});

		it('should validate extend array mix response', () => {
			const schema = {
				200: {
					extends: {
						key: 'role',
						listSchema,
						schemas: {
							user: schemaUser,
							coach: schemaCoach,
						},
					},
				},
			};

			const res = createResponse({
				response: schema,
			});

			// check user schema
			const payload = {
				hasMore: false,
				data: [
					{
						...payloadObjectUser,
						coachProperty: 'coach',
						extra: 'property',
					},
					{
						...payloadObjectCoach,
						userProperty: 'user',
						extra: 'property',
					},
				],
			};

			expect(payload).property('hasMore');
			expect(payload).property('data').an('array').length(2);
			const validatedPayload = validateResponse(ajv, {} as any, res as any, payload);
			expect(validatedPayload).property('hasMore');
			expect(validatedPayload).property('data').an('array').length(2);
			const [user, coach] = validatedPayload.data;
			expect(user).not.property('extra');
			expect(user).not.property('coachProperty');
			expect(user).property('userProperty').eq(payloadObjectUser.userProperty);
			expect(coach).not.property('extra');
			expect(coach).not.property('userProperty');
			expect(coach).property('coachProperty').eq(payloadObjectCoach.coachProperty);
		});

		it('fallback should work', () => {
			const fallbackSchema = {
				type: 'object',
				additionalProperties: false,
				properties: {
					role: {
						type: 'string'
					},
					extra: {
						type: 'string',
					},
				},
			};

			const schema = {
				200: {
					extends: {
						key: 'role',
						fallback: fallbackSchema,
						schemas: {
							user: schemaUser,
							coach: schemaCoach,
						},
					},
				},
			};

			const res = createResponse({
				response: schema,
			});

			// check user schema
			const payload = {
				role: 'another',
				extra: 'property',
				userProperty: 'user',
				coachProperty: 'coach',
			};

			const validatedPayload = validateResponse(ajv, {} as any, res as any, payload);
			expect(validatedPayload).property('role').eq(payload.role);
			expect(validatedPayload).property('extra').eq(payload.extra);
			expect(validatedPayload).not.property('userProperty');
			expect(validatedPayload).not.property('coachProperty');
		});

	});

	describe('Generate Schema', () => {

		it('generate', async () => {

			const schemaGenerator = new SchemasGenerator(ajv);

			schemaGenerator.setSwaggerOptions(SWAGGER_OPTIONS.TEST_OPTION);

			Object.keys(SHARED_TYPES).forEach(key => {

				ajv.addSchema(SHARED_TYPES[key]);
				schemaGenerator.addSharedSchema({
					name: key,
					schemaRef: SHARED_TYPES[key].$id
				});

			});

			Object.keys(ROUTE_DATA).forEach(key => {

				ajv.addSchema(ROUTE_DATA[key].schema);
				schemaGenerator.addRouteSchema({
					url: ROUTE_DATA[key].url,
					method: ROUTE_DATA[key].method,
					schemaRef: ROUTE_DATA[key].schema.$id
				});

			});

			await SwaggerParser.validate(schemaGenerator.generateSwaggerObject());

		});

		it('expand test', async () => {

			const schemaGenerator = new SchemasGenerator(ajv);

			const result = schemaGenerator.extendToSchemaData({
				key: 'test',
				fallback: {
					$ref: 'test'
				},
				schemas: {
					test1: {
						$ref: 'test1'
					},
					test2: {
						$ref: 'test2'
					},
					test3: {
						$ref: 'test3'
					},
					test4: {
						$ref: 'test4'
					}
				}
			});

			expect(JSON.stringify(result)).to.equal(JSON.stringify([
				{ '$ref': 'test' },
				{ '$ref': 'test1' },
				{ '$ref': 'test2' },
				{ '$ref': 'test3' },
				{ '$ref': 'test4' }
			]));

		});

		it('merge', async () => {

			const schemaGenerator = new SchemasGenerator(ajv);

			const testSchema = {
				$id: 'test',
				type: 'object',
				required: ['test1'],
				properties: {
					test1: {
						type: 'string'
					},
					test2: {
						type: 'string'
					}
				}
			}

			ajv.addSchema(testSchema);

			const result = schemaGenerator.mergeSchema({
				$merge: {
					source: {
						$ref: testSchema.$id
					},
					with: {
						properties: {
							test3: {
								type: 'number'
							}
						}
					}
				}
			});

			expect(Object.keys(result.properties).length).to.equal(3);

		});

	});

});
