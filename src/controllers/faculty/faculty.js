import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

// Controller for the faculty list page
const facultyListPage = (req, res, next) => {
  try {
    const sort = req.query.sort;
    const facultyList = getSortedFaculty(sort);

    res.render('faculty/list', {
      title: 'Faculty Directory',
      faculty: facultyList,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for the faculty detail page
const facultyDetailPage = (req, res, next) => {
  try {
    const { facultyId } = req.params;
    console.log('facultyId param:', facultyId);
    const facultyMember = getFacultyById(facultyId);
    console.log('facultyMember found:', facultyMember);

    if (!facultyMember) {
      const error = new Error('Faculty member not found');
      error.status = 404;
      throw error;
    }

    res.render('faculty/detail', {
      title: facultyMember.name,
      faculty: facultyMember,
    });
  } catch (error) {
    next(error);
  }
};

export { facultyListPage, facultyDetailPage };