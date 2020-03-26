export const SHARED_TYPES: any = {
    ObjectId: {
        $id: 'SharedObjectId',
        type: 'string',
        example: '507f1f77bcf86cd799439011',
    }
};

export const ROUTE_DATA: any = {
    QUERYSTRING_TEST: {
        url: '/test1',
        method: 'GET',
        schema: {
            $id: 'ControllersTest1',
            summary: 'test1',
            tags: ['Test1'],
            security: [
                {
                    BearerAuth: [],
                },
            ],
            querystring: {
                type: 'object',
                required: ['title', 'about'],
                properties: {
                    title: {
                        type: 'string'
                    },
                    about: {
                        type: 'string'
                    },
                    logo: {
                        $ref: 'SharedObjectId'
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        about: {
                            type: 'string'
                        },
                        logo: {
                            $ref: 'SharedObjectId'
                        },
                    }
                }
            },
        },
    },
    BODY_TEST: {
        url: '/test2/:idUser',
        method: 'POST',
        schema: {
            $id: 'ControllersTest2',
            summary: 'test2',
            tags: ['Test2'],
            body: {
                type: 'object',
                required: ['banner', 'status'],
                properties: {
                    banner: {
                        $ref: 'SharedObjectId'
                    },
                    status: {
                        type: 'string'
                    },
                    sportTypes: {
                        type: 'string'
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        banner: {
                            $ref: 'SharedObjectId'
                        },
                        status: {
                            type: 'string'
                        },
                        sportTypes: {
                            type: 'string'
                        },
                    }
                }
            },
        },
    },
    PARAMS_TEST: {
        url: '/test3',
        method: 'GET',
        schema: {
            $id: 'ControllersTest3',
            summary: 'test3',
            tags: ['Test3'],
            params: {
                type: 'object',
                required: ['idUser'],
                properties: {
                    idUser: {
                        $ref: 'SharedObjectId'
                    },
                },
            },
            querystring: {
                type: 'object',
                properties: {
                    socials: {
                        type: 'string'
                    },
                    location: {
                        $ref: 'SharedObjectId'
                    },
                    metrics: {
                        type: 'string'
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        socials: {
                            type: 'string'
                        },
                        location: {
                            $ref: 'SharedObjectId'
                        },
                        metrics: {
                            type: 'string'
                        },
                    }
                }
            },
        },
    },
    HEADERS_TEST: {
        url: '/test4',
        method: 'GET',
        schema: {
            $id: 'ControllersTest4',
            summary: 'test4',
            tags: ['Test4'],
            security: [
                {
                    BearerAuth: [],
                },
            ],
            headers: {
                type: 'object',
                required: ['title', 'about'],
                properties: {
                    title: {
                        type: 'string'
                    },
                    about: {
                        type: 'string'
                    },
                    logo: {
                        $ref: 'SharedObjectId'
                    },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        about: {
                            type: 'string'
                        },
                        logo: {
                            $ref: 'SharedObjectId'
                        },
                    }
                }
            },
        },
    },
};

export const SWAGGER_OPTIONS: any = {
    TEST_OPTION: {
        openapi: '3.0.0',
        info: {
            description: 'test',
            version: 'test',
            title: 'test',
            contact: {
                email: 'test@gmail.com'
            },
        },
        tags: [
            {
                name: 'Test1'
            },
            {
                name: 'Test2'
            },
            {
                name: 'Test3'
            }
        ],
        servers: [
            {
                url: 'test'
            }
        ],
    }
};