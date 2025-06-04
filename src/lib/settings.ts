export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/kepalasekolah(.*)": ["kepala_sekolah"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/list/teachers": ["admin", "kepala_sekolah"],
  "/list/students": ["admin", "kepala_sekolah"],
  "/list/subjects": ["admin", "kepala_sekolah"],
  "/list/classes": ["admin", "teacher", "kepala_sekolah"],
  "/list/lessons": ["admin", "teacher", "kepala_sekolah"],
  "/list/exams": ["admin", "teacher", "student", "kepala_sekolah"],
  "/list/assignments": ["admin", "teacher", "student", "kepala_sekolah"],
  "/list/results(.*)": ["admin", "teacher", "student", "kepala_sekolah"],
  "/list/attendance": ["admin", "teacher", "student", "kepala_sekolah"],
  "/list/events": ["admin", "teacher", "student", "kepala_sekolah"],
  "/list/announcements": ["admin", "teacher", "student", "kepala_sekolah"],
};