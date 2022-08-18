import mongoose from "mongoose";
import PostMessage from "../models/postMessages.js"

export const getPosts = async (req, res) => {
    try {
        const { page } = req.query;
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT;
        const total = await PostMessage.count({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostMessage.findById(id);
        res.status(200).json(post);
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })
    try {
        await newPost.save();
        res.status(200).json(newPost);
    } catch (error) {
        console.log(error)
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No posts for Id');
        const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...req.body, _id }, { new: true });
        res.json(updatedPost)
    } catch (error) {
        console.log(error)
        res.status(409).json({ message: error.message });
    }
}

export const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No posts for Id');
        await PostMessage.findByIdAndRemove(id);
        res.json({ message: 'Post deleted successfully' })
    } catch (error) {
        console.log(error)
        res.status(409).json({ message: error.message });
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.userId) return res.json({ message: 'Unauthorized' });
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No posts for Id');
        const post = await PostMessage.findById(id);
        const index = post.likes.findIndex((id) => id === String(req.userId));
        if (index === -1) {
            post.likes.push(req.userId);
        } else {
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
        res.json(updatedPost)
    } catch (error) {
        console.log(error)
        res.status(409).json({ message: error.message });
    }
}

export const getPostsBySearch = async (req, res) => {
    try {
        const { searchQuery, tags } = req.query;
        const title = new RegExp(searchQuery, 'i');
        const posts = await PostMessage.find({ $or: [{ title }, { tags: { $in: tags.split(",") } }] });
        const newArray = posts.map(data => data._id)
        res.status(200).json({ data: posts });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        const post = await PostMessage.findById(id);
        post.comments.push(value);
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message });
    }
}

