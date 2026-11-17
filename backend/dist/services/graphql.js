import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, graphql, } from "graphql";
import { Contest, Discussion, Profile, User } from "./store.js";
const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        role: { type: GraphQLString },
    },
});
const ProfileType = new GraphQLObjectType({
    name: "Profile",
    fields: {
        id: { type: GraphQLString },
        userId: { type: GraphQLString },
        platform: { type: GraphQLString },
        handle: { type: GraphQLString },
        rating: { type: GraphQLInt },
        solved: { type: GraphQLInt },
    },
});
const ContestType = new GraphQLObjectType({
    name: "Contest",
    fields: {
        id: { type: GraphQLString },
        title: { type: GraphQLString },
        platform: { type: GraphQLString },
        status: { type: GraphQLString },
        startAt: { type: GraphQLString },
        url: { type: GraphQLString },
    },
});
const DiscussionType = new GraphQLObjectType({
    name: "Discussion",
    fields: {
        id: { type: GraphQLString },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        category: { type: GraphQLString },
        likes: { type: GraphQLInt },
    },
});
const toPublic = (document) => {
    if (!document)
        return null;
    const { _id, passwordHash: _passwordHash, ...value } = document;
    return { ...value, id: value.id ?? _id };
};
export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: {
            users: {
                type: new GraphQLList(UserType),
                resolve: async () => (await User.find().limit(100).lean()).map(toPublic),
            },
            profiles: {
                type: new GraphQLList(ProfileType),
                resolve: async () => (await Profile.find().limit(100).lean()).map(toPublic),
            },
            contests: {
                type: new GraphQLList(ContestType),
                args: { limit: { type: GraphQLInt } },
                resolve: async (_source, args) => (await Contest.find().sort({ startAt: 1 }).limit(Math.min(Math.max(args.limit ?? 20, 1), 100)).lean()).map(toPublic),
            },
            discussions: {
                type: new GraphQLList(DiscussionType),
                resolve: async () => (await Discussion.find().sort({ createdAt: -1 }).limit(100).lean()).map(toPublic),
            },
            health: {
                type: GraphQLBoolean,
                resolve: () => true,
            },
        },
    }),
});
export const executeGraphql = (source, variables) => graphql({ schema, source, variableValues: variables });
