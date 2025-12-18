import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import TableSkeleton from '@/components/TableSkeleton';
import { BlogCategoryService } from '@/services/blogCategory.service';
import { BlogCategoryDto } from '@/types/blog.types';
import { PATHS, buildPath } from '@/routes/paths';
import { toast } from 'react-toastify';

const ListBlogCategories: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<BlogCategoryDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await BlogCategoryService.getCategories(true);
                if (res.success && res.data) {
                    setCategories(res.data);
                }
            } catch (err: any) {
                const msg = err.message || 'Không thể tải danh mục blog';
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const flatCategories = useMemo(() => {
        const result: Array<BlogCategoryDto & { level: number }> = [];
        const traverse = (list: BlogCategoryDto[], level: number) => {
            list.forEach((c) => {
                result.push({ ...c, level });
                if (c.children && c.children.length > 0) {
                    traverse(c.children, level + 1);
                }
            });
        };
        traverse(categories, 0);
        return result;
    }, [categories]);

    const handleAdd = () => {
        navigate(
            buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.BLOG_CATEGORIES.ROOT,
                PATHS.ADMIN.BLOG_CATEGORIES.ADD
            )
        );
    };

    const tableBody = useMemo(() => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={4}>
                        <TableSkeleton
                            rows={4}
                            columns={[
                                { type: 'text' },
                                { type: 'text' },
                                { type: 'text' },
                                { type: 'text' },
                            ]}
                        />
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr>
                    <td colSpan={4} className="text-danger text-center py-3">
                        {error}
                    </td>
                </tr>
            );
        }

        if (flatCategories.length === 0) {
            return (
                <tr>
                    <td colSpan={4} className="text-center py-3 text-muted">
                        Chưa có danh mục nào.
                    </td>
                </tr>
            );
        }

        return (
            <>
                {flatCategories.map((cat) => (
                    <tr key={cat.id}>
                        <td>
                            <span style={{ paddingLeft: `${cat.level * 16}px` }}>
                                {cat.categoryName}
                            </span>
                        </td>
                        <td className="text-muted">{cat.description || '—'}</td>
                        <td>
                            <StatusBadge status={cat.status || 'INACTIVE'} />
                        </td>
                        <td className="text-muted">
                            {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '—'}
                        </td>
                    </tr>
                ))}
            </>
        );
    }, [error, flatCategories, isLoading]);

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom flex-wrap gap-2">
                <h4 className="fw-bold mb-0">Danh mục Blog</h4>
                <Button
                    variant="primary"
                    size="md"
                    icon="ti ti-plus"
                    type="button"
                    onClick={handleAdd}
                >
                    Thêm danh mục
                </Button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Tên danh mục</th>
                                    <th>Mô tả</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>{tableBody}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListBlogCategories;
