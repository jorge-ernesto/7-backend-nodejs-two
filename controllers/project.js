'use strict'

var Project = require('../models/project');
var fs = require('fs');
var path = require('path');

var controller = {

	home: function (req, res) {
		return res.status(200).send({
			message: 'Soy la home'
		});
	},

	test: function (req, res) {
		return res.status(200).send({
			message: "Soy el metodo o accion test del controlador de project"
		});
	},

	saveProject: async function (req, res) {
		var project = new Project();

		var params = req.body;
		project.name = params.name;
		project.description = params.description;
		project.category = params.category;
		project.year = params.year;
		project.langs = params.langs;
		project.image = null;

		// Mongoose 6
		/*
		project.save((err, projectStored) => {
			if (err) return res.status(500).send({ message: 'Error al guardar el documento.' });

			if (!projectStored) return res.status(404).send({ message: 'No se ha podido guardar el proyecto.' });

			return res.status(200).send({ project: projectStored });
		});
		*/

		// Mongoose 7
		try {
			let projectStored = await project.save();
			console.log('projectStored', projectStored);

			if (!projectStored) return res.status(404).send({ message: 'No se ha podido guardar el proyecto.' });

			return res.status(200).send({ project: projectStored });
		} catch (err) {
			return res.status(500).send({ message: 'Error al guardar el documento.' });
		}
	},

	getProject: async function (req, res) {
		var projectId = req.params.id;

		if (projectId == null) return res.status(404).send({ message: 'El proyecto no existe.' });

		// Mongoose 6
		/*
		Project.findById(projectId, (err, project) => {

			if (err) return res.status(500).send({ message: 'Error al devolver los datos.' });

			if (!project) return res.status(404).send({ message: 'El proyecto no existe.' });

			return res.status(200).send({
				project
			});

		});
		*/

		// Mongoose 7
		try {

			let project = await Project.findById(projectId);

			if (!project) return res.status(404).send({ message: 'El proyecto no existe.' });

			return res.status(200).send({
				project
			});
		} catch (err) {
			return res.status(500).send({ message: 'Error al devolver los datos.' });
		}
	},

	getProjects: async function (req, res) {

		// Mongoose 6
		/*
		Project.find({}).sort('-year').exec((err, projects) => {

			if (err) return res.status(500).send({ message: 'Error al devolver los datos.' });

			if (!projects) return res.status(404).send({ message: 'No hay projectos que mostrar.' });

			return res.status(200).send({ projects });
		});
		*/

		// Mongoose 7
		try {

			let projects = await Project.find({}).sort('-year').exec();
			console.log('projects', projects);

			if (!projects) return res.status(404).send({ message: 'No hay projectos que mostrar.' });

			return res.status(200).send({ projects });
		} catch (err) {
			return res.status(500).send({ message: 'Error al devolver los datos.' });
		}

	},

	updateProject: async function (req, res) {
		var projectId = req.params.id;
		var update = req.body;

		// Mongoose 6
		/*
		Project.findByIdAndUpdate(projectId, update, { new: true }, (err, projectUpdated) => {
			if (err) return res.status(500).send({ message: 'Error al actualizar' });

			if (!projectUpdated) return res.status(404).send({ message: 'No existe el proyecto para actualizar' });

			return res.status(200).send({
				project: projectUpdated
			});
		});
		*/

		// Mongoose 7
		try {
			let projectUpdated = await Project.findByIdAndUpdate(projectId, update, { new: true });

			if (!projectUpdated) return res.status(404).send({ message: 'No existe el proyecto para actualizar' });

			return res.status(200).send({
				project: projectUpdated
			});
		} catch (err) {
			return res.status(500).send({ message: 'Error al actualizar' });
		}

	},

	deleteProject: async function (req, res) {
		var projectId = req.params.id;
		console.log('deleteProject', projectId)

		// Mongoose 6
		/*
		Project.findByIdAndRemove(projectId, (err, projectRemoved) => {
			if (err) return res.status(500).send({ message: 'No se ha podido borrar el proyecto' });

			if (!projectRemoved) return res.status(404).send({ message: "No se puede eliminar ese proyecto." });

			return res.status(200).send({
				project: projectRemoved
			});
		});
		*/

		// Mongoose 7
		try {
			let projectRemoved = await Project.findByIdAndRemove(projectId);

			if (!projectRemoved) return res.status(404).send({ message: "No se puede eliminar ese proyecto." });

			return res.status(200).send({
				project: projectRemoved
			});
		} catch (err) {
			return res.status(500).send({ message: 'No se ha podido borrar el proyecto' });
		}
	},

	uploadImage: async function (req, res) {
		var projectId = req.params.id;
		var fileName = 'Imagen no subida...';

		if (req.files) {
			var filePath = req.files.image.path;
			var fileSplit = filePath.split('\\');
			var fileName = fileSplit[1];
			var extSplit = fileName.split('\.');
			var fileExt = extSplit[1];

			if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {

				// Mongoose 6
				/*
				Project.findByIdAndUpdate(projectId, { image: fileName }, { new: true }, (err, projectUpdated) => {
					if (err) return res.status(500).send({ message: 'La imagen no se ha subido' });

					if (!projectUpdated) return res.status(404).send({ message: 'El proyecto no existe y no se ha asignado la imagen' });

					return res.status(200).send({
						project: projectUpdated
					});
				});
				*/

				// Mongoose 7
				try {
					let projectUpdated = await Project.findByIdAndUpdate(projectId, { image: fileName }, { new: true });

					if (!projectUpdated) return res.status(404).send({ message: 'El proyecto no existe y no se ha asignado la imagen' });

					return res.status(200).send({
						project: projectUpdated
					});
				} catch (err) {
					return res.status(500).send({ message: 'La imagen no se ha subido' });
				}

			} else {
				fs.unlink(filePath, (err) => {
					return res.status(200).send({ message: 'La extensión no es válida' });
				});
			}

		} else {
			return res.status(200).send({
				message: fileName
			});
		}

	},

	getImageFile: function (req, res) {
		var file = req.params.image;
		var path_file = './uploads/' + file;

		fs.exists(path_file, (exists) => {
			if (exists) {
				return res.sendFile(path.resolve(path_file));
			} else {
				return res.status(200).send({
					message: "No existe la imagen..."
				});
			}
		});
	}

};

module.exports = controller;
