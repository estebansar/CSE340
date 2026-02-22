import { getFacultyById, getSortedFaculty } from '../../models/faculty/faculty.js';

// Controller for the faculty list page
const facultyListPage = async (req, res, next) => {
  try {
    const sort = req.query.sort;
    const facultyList = await getSortedFaculty(sort);

    res.render('faculty/list', {
      title: 'Faculty Directory',
      faculty: facultyList,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for the faculty detail page
// Controller for the faculty detail page
const facultyDetailPage = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    const facultyMember = await getFacultyById(facultyId);

    if (!facultyMember || Object.keys(facultyMember).length === 0) {
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