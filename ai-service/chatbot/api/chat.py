from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
from llm.rag import RAGPipeline
from vectorstore.create import get_vector_store
import config.setting as config
import re
import os
import httpx

router = APIRouter(prefix="/api/chat", tags=["chat"])

CLINIC_SYSTEM_PROMPT = """Bạn là "HealthAssistant" - trợ lý tư vấn y tế thông minh của Hệ thống Phòng khám Health Clinics.
Hãy trả lời bằng tiếng Việt một cách thân thiện, chuyên nghiệp, chu đáo và dễ hiểu.
Hỗ trợ khách hàng giải đáp các thông tin về:
1. Giới thiệu các Bác sĩ của phòng khám (dựa trên danh sách bác sĩ thực tế lấy được từ hệ thống).
2. Thông tin về các loại thuốc có sẵn trong nhà thuốc phòng khám (dựa trên danh sách thuốc thực tế).
3. Hướng dẫn quy trình đặt lịch khám bệnh trực tuyến.
4. Trả lời các kiến thức y học cơ bản về bệnh lý phòng khám hỗ trợ điều trị.
LƯU Ý QUAN TRỌNG: Bạn chỉ tư vấn thông tin và đưa ra lời khuyên chung, TUYỆT ĐỐI KHÔNG tự ý kê đơn thuốc hoặc đưa ra chẩn đoán bệnh thay thế cho bác sĩ. Luôn khuyên khích khách hàng đặt lịch khám trực tiếp với bác sĩ để có chẩn đoán chính xác nhất. Không đề cập đến ShopeeLite hay ShopAI hay e-commerce."""

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    use_rag: bool = True
    top_k: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None
    num_sources: Optional[int] = None
    products: Optional[List[dict]] = None


BACKEND_URL = config.BACKEND_URL.rstrip('/')
if BACKEND_URL.endswith('/api'):
    API_NHANVIEN = f"{BACKEND_URL}/nhanvien"
    API_THUOC = f"{BACKEND_URL}/thuoc"
    API_LOAIBENH = f"{BACKEND_URL}/loai-benh"
else:
    API_NHANVIEN = f"{BACKEND_URL}/api/nhanvien"
    API_THUOC = f"{BACKEND_URL}/api/thuoc"
    API_LOAIBENH = f"{BACKEND_URL}/api/loai-benh"

async def fetch_doctors() -> str:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(API_NHANVIEN)
            if response.status_code == 200:
                data = response.json()
                doctors = []
                for nv in data:
                    ma_nhom = (nv.get("maNhom") or nv.get("ma_nhom") or "").upper()
                    ten_nhom = (nv.get("tenNhom") or nv.get("ten_nhom") or "").lower()
                    if ma_nhom == "DOCTOR" or "bác sĩ" in ten_nhom or "bac si" in ten_nhom or "bác sỹ" in ten_nhom or "doctors" in ma_nhom.lower():
                        doctors.append(nv)
                
                if not doctors:
                    return ""
                
                context = "\n\nDanh sách Bác sĩ tại phòng khám thực tế (Dùng thông tin này để giới thiệu cho khách):\n"
                for doc in doctors:
                    sdt = doc.get("dienThoai") or doc.get("dien_thoai") or "Không có"
                    email = doc.get("email") or "Không có"
                    context += f"- Bác sĩ: {doc.get('hoTenNV')}, Giới tính: {doc.get('gioiTinh', 'Nam/Nữ')}, SĐT: {sdt}, Email: {email}\n"
                return context
    except Exception as e:
        print(f"Failed to fetch doctors: {e}")
    return ""

def extract_drug_keyword(message: str) -> str:
    clean_msg = message.lower()
    for word in ["tìm thuốc", "tim thuoc", "thuốc", "thuoc", "mua thuốc", "mua thuoc", "giá thuốc", "gia thuoc", "bán thuốc", "ban thuoc", "có thuốc", "co thuoc"]:
        clean_msg = clean_msg.replace(word, "")
    return clean_msg.strip()

async def fetch_drugs(keyword: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            if keyword:
                response = await client.get(f"{API_THUOC}/search", params={"keyword": keyword})
            else:
                response = await client.get(API_THUOC, params={"page": 0, "size": 30})
            
            if response.status_code == 200:
                data = response.json()
                items = []
                if isinstance(data, dict):
                    items = data.get("data", [])
                elif isinstance(data, list):
                    items = data
                
                if not items:
                    return ""
                
                context = "\n\nThông tin các loại thuốc có sẵn trong kho nhà thuốc (Dùng thông tin này để tư vấn cho khách):\n"
                for item in items[:8]:
                    dvt = item.get("tenDvt") or "đơn vị"
                    price = f"{int(item.get('donGiaBan', 0)):,}đ" if item.get("donGiaBan") else "Liên hệ"
                    usage = item.get("moTaCachDung") or "Theo chỉ định bác sĩ"
                    context += f"- Thuốc: {item.get('tenThuoc')}, Đơn giá bán: {price}/{dvt}, Xuất xứ: {item.get('xuatXu', 'Không rõ')}, Hướng dẫn sử dụng: {usage}\n"
                return context
    except Exception as e:
        print(f"Failed to fetch drugs: {e}")
    return ""

async def fetch_diseases() -> str:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(API_LOAIBENH)
            if response.status_code == 200:
                data = response.json()
                if not data:
                    return ""
                context = "\n\nCác loại bệnh lý phòng khám có hỗ trợ điều trị:\n"
                for item in data[:15]:
                    context += f"- Bệnh lý: {item.get('tenLoaiBenh') or item.get('TenLoaiBenh')}\n"
                return context
    except Exception as e:
        print(f"Failed to fetch diseases: {e}")
    return ""

async def get_clinical_context(message: str) -> str:
    msg_lower = message.lower()
    context = ""
    
    # Kiểm tra hỏi về bác sĩ
    if any(kw in msg_lower for kw in ["bác sĩ", "bac si", "doctor", "nhân viên", "nhan vien", "bác sỹ", "bac sy", "ai khám", "khám với ai"]):
        context += await fetch_doctors()
        
    # Kiểm tra hỏi về thuốc
    if any(kw in msg_lower for kw in ["thuốc", "thuoc", "medicine", "drug", "đơn thuốc", "don thuoc", "dược", "duoc"]):
        kw = extract_drug_keyword(message)
        context += await fetch_drugs(kw)
        
    # Kiểm tra hỏi về loại bệnh
    if any(kw in msg_lower for kw in ["bệnh", "benh", "đau", "sốt", "ho", "mệt", "triệu chứng", "trieu chung", "khám gì", "kham gi"]):
        context += await fetch_diseases()
        
    # Hướng dẫn đặt lịch khám
    if any(kw in msg_lower for kw in ["đặt lịch", "dat lich", "hẹn khám", "hen kham", "khám bệnh", "kham benh", "đăng ký khám"]):
        context += "\n\n[Quy trình đặt lịch khám tại phòng khám]: Khách hàng đăng nhập vào website bằng tài khoản Patient (Bệnh nhân), chọn mục 'Đặt lịch khám' ở sidebar bên trái, chọn bác sĩ khám, chọn ngày giờ khám phù hợp rồi bấm 'Đặt lịch khám'. Lịch khám sẽ được ghi nhận tự động vào danh sách tiếp nhận của phòng khám.\n"
        
    return context


_rag_pipeline = None


def get_rag_pipeline():
    global _rag_pipeline

    if _rag_pipeline is None:
        vector_store = get_vector_store()
        _rag_pipeline = RAGPipeline(vector_store, config.MODEL_TYPE)

    return _rag_pipeline


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    import traceback
    try:
        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Lấy clinical context từ database backend
        clinical_context = await get_clinical_context(request.message)

        answer = None

        if request.use_rag:
            try:
                rag_pipeline = get_rag_pipeline()
                # RAG query
                result = rag_pipeline.query(
                    query=request.message,
                    conversation_history=history,
                    top_k=request.top_k
                )
                answer = result["answer"]
            except Exception as e:
                print(f"RAG failed, falling back to direct LLM: {e}")

        if answer is None or "ShopAI" in answer or "ShopeeLite" in answer:
            # Fallback to direct LLM with clinical context
            from llm.client import get_llm_client
            try:
                llm_client = get_llm_client(config.MODEL_TYPE)

                system_prompt = CLINIC_SYSTEM_PROMPT
                if clinical_context:
                    system_prompt += clinical_context

                answer = llm_client.chat(
                    user_message=request.message,
                    conversation_history=history,
                    system_prompt=system_prompt
                )
            except ValueError as e:
                print(f"ValueError in chat: {e}")
                return ChatResponse(
                    answer="Xin lỗi bạn, trợ lý ảo tạm thời không thể kết nối. Vui lòng thử lại sau ít phút nhé!",
                    sources=None, num_sources=0, products=None
                )
            except Exception as e:
                traceback.print_exc()
                print(f"LLM error: {e}")
                return ChatResponse(
                    answer="Xin lỗi bạn, trợ lý ảo đang gặp sự cố kỹ thuật. Vui lòng liên hệ bộ phận hỗ trợ nhe!",
                    sources=None, num_sources=0, products=None
                )

        return ChatResponse(
            answer=answer,
            sources=None,
            num_sources=0,
            products=None
        )

    except HTTPException:
        raise
    except Exception as e:
        error_detail = str(e)
        traceback.print_exc()
        print(f"Unexpected error in chat endpoint: {error_detail}")
        return ChatResponse(
            answer="Hệ thống đang gặp sự cố. Bạn vui lòng thử lại sau nhé!",
            sources=None,
            num_sources=0,
            products=None
        )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    try:
        # Lấy clinical context từ database backend
        clinical_context = await get_clinical_context(request.message)

        history = []
        if request.conversation_history:
            for msg in request.conversation_history:
                history.append({
                    "role": msg.role,
                    "content": msg.content
                })

        from fastapi.responses import StreamingResponse
        from llm.client import get_llm_client
        import json

        llm_client = get_llm_client(config.MODEL_TYPE)
        
        system_prompt = CLINIC_SYSTEM_PROMPT
        if clinical_context:
            system_prompt += clinical_context

        def generate():
            for chunk in llm_client.stream_chat(
                user_message=request.message,
                conversation_history=history,
                system_prompt=system_prompt
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
